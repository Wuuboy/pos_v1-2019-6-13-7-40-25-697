const tags = [
    'ITEM000001',
    'ITEM000001',
    'ITEM000001',
    'ITEM000001',
    'ITEM000001',
    'ITEM000003-2.5',
    'ITEM000005',
    'ITEM000005-2',
];

/*
 *decode barcodes to {barcode:count}
 */
function decodeBarcodes  ()  {
    let decodedBarcodes ={}
    tags.filter(x =>{
        if (x.includes('-')){
            decodedBarcodes[x.split('-')[0]] = decodedBarcodes[x.split('-')[0]]?decodedBarcodes[x.split('-')[0]]+parseFloat(x.split('-')[1]):parseFloat(x.split('-')[1])
        }else {
            decodedBarcodes[x]=(decodedBarcodes[x]+1)||1
        }
    })
    return decodedBarcodes
}
module.exports = decodeBarcodes;

/*
 *return all  items info to [{barcode:‘ITEM000004’,name:'电池',unit:'件',price:2.0}]
 */
function loadAllItems(){
    return [
        {
            barcode: 'ITEM000000',
            name: '可口可乐',
            unit: '瓶',
            price: 3.00
        },
        {
            barcode: 'ITEM000001',
            name: '雪碧',
            unit: '瓶',
            price: 3.00
        },
        {
            barcode: 'ITEM000002',
            name: '苹果',
            unit: '斤',
            price: 5.50
        },
        {
            barcode: 'ITEM000003',
            name: '荔枝',
            unit: '斤',
            price: 15.00
        },
        {
            barcode: 'ITEM000004',
            name: '电池',
            unit: '个',
            price: 2.00
        },
        {
            barcode: 'ITEM000005',
            name: '方便面',
            unit: '袋',
            price: 4.50
        }
    ];
}

/*
 *conbine items to [{barcode:‘ITEM000004’,name:'电池',unit:'件',price:2.0,count:1}]
 */
function conbineItems(){
    const decodedBarcodes = decodeBarcodes()
    const itemsWithoutCounts = loadAllItems()
    let items = []
    const decodedBarcodesKeys = Object.keys(decodedBarcodes)
    // for (let x = 0;x<itemsWithoutCounts.length;x++) {
    //     if (decodedBarcodesKeys.indexOf(itemsWithoutCounts[x].barcode)>=0) {
    //         const item = {
    //             barcode: itemsWithoutCounts[x].barcode,
    //             name: itemsWithoutCounts[x].name,
    //             unit: itemsWithoutCounts[x].unit,
    //             price: itemsWithoutCounts[x].price,
    //             // count: itemsWithoutCounts[x].barcode
    //         }
    //         items.push(item)
    //     }}
    itemsWithoutCounts.filter(x => {
        if (decodedBarcodesKeys.includes(x.barcode)) {
            const item = {
                barcode: x.barcode,
                name: x.name,
                unit: x.unit,
                price: x.price,
                count: decodedBarcodes[x.barcode]
            }
            items.push(item)
        }
    })
    return items
}
module.exports = conbineItems;

/*
 *main function1
 */
function decodeTags () {
    const decodedBarcodes = decodeBarcodes()
    const itemsWithoutCounts = loadAllItems()
    const items = conbineItems(decodedBarcodes,itemsWithoutCounts)
    return items
}
module.exports = decodeTags;

function loadAllPromotions () {
    return [
        {
            type: 'BUY_TWO_GET_ONE_FREE',
            barcodes: [
                'ITEM000000',
                'ITEM000001',
                'ITEM000005'
            ]
        }
    ];
}
module.exports = loadAllPromotions;

function promoteReceiptItems  () {
    const items = decodeTags()
    const promotions = loadAllPromotions()
    for (let i = 0;i<items.length;i++){
        if (promotions[0].barcodes.includes(items[i].barcode)) {
            items[i].subTotal = (items[i].count-parseInt(items[i].count/3)) * items[i].price
            items[i].subTotalWithoutDiscount = items[i].count * items[i].price
        }else {
            items[i].subTotal = items[i].count * items[i].price
            items[i].subTotalWithoutDiscount = items[i].count * items[i].price
        }
    }
    const  receiptItems = items
    return receiptItems

    // return items.forEach(x=>{
    //     if (promotions[0].barcodes.includes(x.barcode)) {
    //         x.subTotal = x.price * (x.count - parseInt(x.count/3))
    //         x.subTotalWithoutDiscount = x.price * x.count
    //     }else {
    //         x.subTotal = x.price * x.count
    //         x.subTotalWithoutDiscount = x.price * x.count
    //     }
    // })
}
module.exports = promoteReceiptItems;

function caculateReceiptItems() {
    const promotions =loadAllPromotions()
    const receiptItems = promoteReceiptItems()
    return receiptItems
}
module.exports = caculateReceiptItems;

function caculateReceiptTotal (){
    const receiptItems = caculateReceiptItems()
    const total = receiptItems.map(x => x.subTotal).reduce((pre,item) => pre + item)
    const totalWithoutDiscount = receiptItems.map(x => x.subTotalWithoutDiscount).reduce((pre,item) => pre + item)
    const totalInfo = {
        totalPrice:total,
        totalWithoutDiscountPrice:totalWithoutDiscount
    }
    return totalInfo
}
module.exports = caculateReceiptTotal;

function caculateReceiptSaving () {
    const totalInfo = caculateReceiptTotal()
    const saving = totalInfo.totalWithoutDiscountPrice - totalInfo.totalPrice
    return saving
}
module.exports = caculateReceiptSaving;

function caculateReceipt (){
    const receiptItems = caculateReceiptItems()
    const saving = caculateReceiptSaving()
    const totalInfo = caculateReceiptTotal()
    totalInfo.saving = saving
    // receiptItems.push(saving)
    receiptItems.push(totalInfo)
    const receipt = receiptItems
    return receipt
}
module.exports = caculateReceipt;

function renderReceipt() {
    const receipt = caculateReceipt();
    let renderedReceipt  = "***<没钱赚商店>收据***\n";
    for (i=0;i<receipt.length-1;i++) {
        renderedReceipt += `名称：${receipt[i].name}，数量：${receipt[i].count}${receipt[i].unit}，单价：${receipt[i].price.toFixed(2)}(元)，小计：${receipt[i].subTotal.toFixed(2)}(元)\n`
    }
    return renderedReceipt += `----------------------
总计：${receipt[i].totalPrice.toFixed(2)}(元)
节省：${receipt[i].saving.toFixed(2)}(元)
**********************`
}
module.exports = renderReceipt;

function printReceipt(tags){
    console.log(renderReceipt(tags))
}
module.exports = printReceipt;