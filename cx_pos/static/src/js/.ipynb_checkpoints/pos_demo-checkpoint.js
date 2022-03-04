odoo.define('pos_demo.custom', function (require) {
    "use strict";

    var models = require('point_of_sale.models');
    var core = require('web.core');
    var screens = require('point_of_sale.screens');
    var Widget = require('web.Widget');
    var ajax = require('web.ajax');

    var qweb = core.qweb;

    //Load printer_id and register_id fields
    models.load_fields('account.tax', ['printer_id']);
    models.load_fields('pos.payment.method', ['register_id']);

    //5% Discount Button (for test purposes)
    var discount_button = screens.ActionButtonWidget.extend({
      template: 'BtnDiscount',
      button_click: function () {
          var order = this.pos.get_order();
          if (order.selected_orderline) {
              order.selected_orderline.set_discount(5);
          }
      }
  });

    screens.define_action_button({
        'name': 'discount_btn',
        'widget': discount_button
  });
    
    //Print Receipt By API Button
    screens.ReceiptScreenWidget.include({
        renderElement: function(){
            var self = this;
            this._super();
            this.$('.print_api_button').click(function(){
                self.click_print_api();
            });
        },
        click_print_api: function(){
          //Get data from receipt
            var order = this.pos.get_order();
            var order_for_print = order.export_for_printing();
            var payment_methods = this.pos.payment_methods;

            console.log(order_for_print);
            console.log(order);
            console.log(payment_methods);

            let client = true;

            if (order_for_print.client){
              client = order_for_print.client;

            } else {
              client = "";
            }

            let products = [];

            //Get product data from order lines
            for (let index=0; index < order_for_print.orderlines.length; index++){
                let {product_name, price, quantity, price_with_tax_before_discount, discount} = order_for_print.orderlines[index];

                //PerAmount set false by default. Not implemented in Odoo yet.
                if (discount > 0){
                  let size = discount*100;
                  discount = { 
                    PerAmount:false,
                    size:size
                  };
                } else{
                  discount = { 
                    PerAmount:false,
                    size:0
                  };
                }

                // Default code and surcharge values. Not implemented in Odoo yet
                let code = 0;
                let surcharge = { 
                  PerAmount: false,
                  size: 0
                };
                
                //Convert price and quantity to values fiscal printer can accept
                let tax = Math.round(((price_with_tax_before_discount/quantity)/price - 1)*100);
                price *= 100;
                quantity *= 1000;
                products.push({tax:tax,
                              price:price,
                              quantity: quantity,
                              code:code,
                              description:product_name,
                              discount: discount,
                              surcharge: surcharge
                            });
            }

            //Set tax index registered in fiscal printed
            let taxes = order_for_print.tax_details;
            for(let t_index = 0; t_index < taxes.length; t_index++){
              for(let p_index = 0; p_index < products.length; p_index++){

                if(products[p_index].tax === taxes[t_index].tax.amount){
                  products[p_index].tax = taxes[t_index].tax.printer_id;
                } 
              }
            }

            //set payment methods
            let paymentlines = order_for_print.paymentlines;
            let totalPay = null;
            let partialPay = [];

            if (paymentlines.length === 1){
              totalPay = paymentlines[0].payment_method;
              partialPay = null;

              for(let pm_index =0; pm_index < payment_methods.length; pm_index++){
                if(totalPay === payment_methods[pm_index].name){
                  totalPay = payment_methods[pm_index].register_id;
                }
              }

            } else{

              for(let pm_index =0; pm_index < payment_methods.length; pm_index++){
                for(let pl_index=0; pl_index < paymentlines.length; pl_index++){
                  if(paymentlines[pl_index].payment_method === payment_methods[pm_index].name){
                    partialPay.push(
                      {
                        ID: payment_methods[pm_index].register_id,
                        amount: paymentlines[pl_index].amount*100
                      }
                    )
                  }
                }
              }
              totalPay = partialPay[partialPay.length -1].ID;
              partialPay.splice(-1);
            }
            
          
            //Make receipt print request
            const receipt = {
                client: {
                  ID: "",
                  bussinessName: client,
                  additionalInfo: ""
                },
                invoiceComment: "",
                products:products,
                // discount: {
                //   PerAmount: true,
                //   size: 0
                // },
                // surcharge: {
                //   PerAmount: false,
                //   size: 0
                // },
                partialPay: partialPay,
                // partialPay: [
                //   {
                //     ID: 0,
                //     amount: 0
                //   }
                // ],
                totalPay: totalPay,
                barCode: 0
              };

              
          
            const options = {
                method: 'POST',
                headers: {
                  'Access-Control-Allow-Origin': '*',
                  'accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(receipt),
              };
          
            const url = 'http://127.0.0.1:12376/orders/post_invoice/'
          
            fetch(url, options)
              .then(data => {
                  if (!data.ok) {
                    throw Error(data.status);
                  }
          
                  return data.json();
          
                    }).then(receipt => {
                      console.log(receipt);
                      
                    }).catch(e => {
                      console.log(e);
                    });

        }
    });
    

});