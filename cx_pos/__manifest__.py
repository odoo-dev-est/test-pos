# -*- coding: utf-8 -*-
{
    'name': "Customizations POS",
    'description': """

    Customizations for Point of Sale, print receipts using api.

    Colaborador: Jesús David Briceño
    """,
    'author': "ESTELIO",
    'category': 'Point of Sale',
    'version': '13.0.1',
    'depends': ['point_of_sale'],
    'data': [
        'views/pos_assets.xml',
        'views/account_tax.xml',
        'views/payment_methods.xml'
    ],
    'qweb':[
        'static/src/xml/pos.xml',
    ],
    'installable': True
}
