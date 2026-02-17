/**
 * Base Price Calculation Module
 * Handles all gold price calculations including base price, making charges, GST, and total
 * 
 * Formulas Used:
 * Base Price = Weight (grams) × Rate (per gram, already adjusted for purity)
 * Making Charges = Base Price × (Making % / 100)
 * GST = (Base Price + Making Charges) × 3%
 * Total = Base Price + Making Charges + GST
 */

/**
 * Calculate base gold price
 * @param {number} weight - Weight in grams
 * @param {number} rate - Rate per gram in rupees
 * @param {number} purity - Purity as decimal (0.916 for 22K, 0.75 for 18K, etc)
 * @returns {number} Base price without any charges
 */
const calculateBasePrice = (weight, rate, purity) => {
    return weight * rate * purity;
};

/**
 * Calculate making charges
 * @param {number} basePrice - Base gold price
 * @param {number} makingPercentage - Making charges as percentage
 * @returns {number} Making charge amount
 */
const calculateMakingCharges = (basePrice, makingPercentage) => {
    return basePrice * (makingPercentage / 100);
};

/**
 * Calculate GST at 3%
 * @param {number} basePrice - Base gold price
 * @param {number} makingCharges - Making charge amount
 * @returns {number} GST amount
 */
const calculateGST = (basePrice, makingCharges) => {
    const subtotal = basePrice + makingCharges;
    return subtotal * 0.03;
};

/**
 * Calculate total price including all charges
 * @param {number} basePrice - Base gold price
 * @param {number} makingCharges - Making charge amount
 * @param {number} gst - GST amount
 * @returns {number} Total price
 */
const calculateTotalPrice = (basePrice, makingCharges, gst) => {
    return basePrice + makingCharges + gst;
};

/**
 * Main calculation function - returns all calculated values
 * When rate is already adjusted for purity (dynamic rate mode)
 * @param {number} weight - Weight in grams
 * @param {number} rate - Already purity-adjusted rate per gram in rupees
 * @param {number} makingPercentage - Making charges percentage
 * @returns {Object} Object containing all calculated values
 */
const calculateAllPricesWithAdjustedRate = (weight, rate, makingPercentage) => {
    // Rate is already adjusted for purity, so no purity multiplication needed
    const basePrice = weight * rate;
    const makingCharges = calculateMakingCharges(basePrice, makingPercentage);
    const gst = calculateGST(basePrice, makingCharges);
    const totalPrice = calculateTotalPrice(basePrice, makingCharges, gst);

    return {
        weight,
        rate,
        makingPercentage,
        basePrice: Math.round(basePrice),
        makingCharges: Math.round(makingCharges),
        gst: Math.round(gst),
        totalPrice: Math.round(totalPrice)
    };
};

/**
 * Main calculation function - returns all calculated values
 * When rate is 24K pure rate (static mode)
 * @param {number} weight - Weight in grams
 * @param {number} rate - Rate per gram of pure 24K gold in rupees
 * @param {number} purity - Purity as decimal
 * @param {number} makingPercentage - Making charges percentage
 * @returns {Object} Object containing all calculated values
 */
const calculateAllPrices = (weight, rate, purity, makingPercentage) => {
    const basePrice = calculateBasePrice(weight, rate, purity);
    const makingCharges = calculateMakingCharges(basePrice, makingPercentage);
    const gst = calculateGST(basePrice, makingCharges);
    const totalPrice = calculateTotalPrice(basePrice, makingCharges, gst);

    return {
        weight,
        rate,
        purity,
        makingPercentage,
        basePrice: Math.round(basePrice),
        makingCharges: Math.round(makingCharges),
        gst: Math.round(gst),
        totalPrice: Math.round(totalPrice)
    };
};

// Export functions
export {
    calculateBasePrice,
    calculateMakingCharges,
    calculateGST,
    calculateTotalPrice,
    calculateAllPrices,
    calculateAllPricesWithAdjustedRate
};
