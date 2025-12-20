// Calculate current pregnancy week based on LMP
export const calculatePregnancyWeek = (lmpDate) => {
    if (!lmpDate) return 0;

    const start = new Date(lmpDate);
    const today = new Date();

    // Difference in milliseconds
    const diffTime = Math.abs(today - start);

    // Difference in days
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Convert to weeks
    const weeks = Math.floor(diffDays / 7);

    // Cap at 42 weeks
    return Math.min(Math.max(weeks, 0), 42);
};

// Calculate due date (EDD) - LMP + 280 days
export const calculateDueDate = (lmpDate) => {
    if (!lmpDate) return null;

    const date = new Date(lmpDate);
    date.setDate(date.getDate() + 280);

    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

// Get trimester based on weeks
export const getTrimester = (weeks) => {
    if (weeks <= 12) return 1;
    if (weeks <= 26) return 2;
    return 3;
};

// Format date for input field (YYYY-MM-DD)
export const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
};

// Calculate age from DOB
export const calculateAge = (dob) => {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

