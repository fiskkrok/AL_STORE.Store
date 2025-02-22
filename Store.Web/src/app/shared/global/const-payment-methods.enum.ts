//TODO: should be moved to the backend
// export const PaymentMethodsList = [

//     PaymentMethods.CREDIT_CARD,
//     PaymentMethods.PAYPAL,
//     PaymentMethods.KLARNA,
//     PaymentMethods.APPLE_PAY,
//     PaymentMethods.GOOGLE_PAY
// ];

export enum ConstPaymentMethods {
    CREDIT_CARD = 'credit_card',
    KLARNA = 'klarna',
    SWISH = 'swish',
    APPLE_PAY = 'apple_pay',
}