export function currencyFormat(amount) {
    return new Intl.NumberFormat('FR', { style: 'currency', currency: 'MGA', minimumFractionDigits: 2 }).format(amount);
}

export function amountPrecision(amount) {
    return amount.toPrecision(2);
}