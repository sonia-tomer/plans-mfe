export const getImage = (name: string): string => {
    const images: Record<string, string> = {
        'plan-pricing-bg': 'https://sr-cdn-1.shiprocket.in/img/plan-pricing-bg-img-3feb26.webp',
        'large-business-section-bg': 'https://sr-cdn-1.shiprocket.in/img/large_business_section_plan_pricingfeb426.webp',
        'calculator-bg': 'https://sr-cdn-1.shiprocket.in/img/shipping_cost_feb426.webp',
    };
    return images[name] || '';
};

