//Register Payment method function
function registerCashier() {
    let ID = Number(document.getElementsByName("register_id")[0].outerText);
    let code = Number(document.getElementsByName("cashier_code")[0].outerText);
    let descriptor = document.getElementsByName("name")[0].outerText;

    const register_cashier = {
        ID,
        code,
        descriptor
    };

    const options = {
        method:'POST',
        headers:{
            'accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(register_cashier),
    };

    const url = 'http://localhost:12376/orders/cashier_register/';

    fetch(url, options)
              .then(data => {
                  if (!data.ok) {
                    throw Error(data.status);
                  }
                   
                  if(data.status === 200){
                      alert(`${descriptor} is registered as cashier!`);
                  }
          
                  return data.json();

                    }).then(register_cashier => {
                        console.log(register_cashier);

                    }).catch(e => {
                      console.log(e);
                    });
}