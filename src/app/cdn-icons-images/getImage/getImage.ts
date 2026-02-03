export const getImage = (name: string): string => {
    const images: Record<string, string> = {
        'plan-pricing-bg': 'https://sr-cdn-1.shiprocket.in/img/plan-pricing-bg-img-3feb26.webp'
    };
    return images[name] || '';
};

