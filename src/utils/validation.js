export const validateMobile = (mobile) => {
    // Indian mobile number validation: 10 digits, starts with 6-9
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
};

export const validateName = (name) => {
    return name && name.length >= 2;
};

export const validateAge = (age) => {
    const ageNum = parseInt(age);
    return ageNum >= 18 && ageNum <= 55; // Reasonable age range for maternal app
};

export const validateOTP = (otp) => {
    return /^\d{6}$/.test(otp);
};

export const validatePassword = (password) => {
    // Minimum 6 characters
    return password && password.length >= 6;
};
