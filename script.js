document.addEventListener('DOMContentLoaded', () => {
    const star = document.getElementById('fallingStar');
    
    window.addEventListener('scroll', () => {
        const scrollPercentage = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        
        // Vertical movement: from top (10%) to bottom (90%)
        const topPos = 10 + (scrollPercentage * 80);
        
        // Horizontal movement: subtle curve/wiggle
        // We'll use a sine wave based on scroll to make it look like a dynamic fall
        const leftOffset = Math.sin(scrollPercentage * Math.PI * 2) * 5; // 5% wiggle
        
        // Rotation: rotates as it falls
        const rotation = scrollPercentage * 360;
        
        star.style.top = `${topPos}%`;
        star.style.left = `${50 + leftOffset}%`;
        star.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
    });

    // Reveal animations for sections
    const steps = document.querySelectorAll('.step');
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    steps.forEach(step => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(50px)';
        step.style.transition = 'all 1s cubic-bezier(0.22, 1, 0.36, 1)';
        observer.observe(step);
    });
});
