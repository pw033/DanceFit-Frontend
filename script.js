// =====================================
// DANCEFIT - WEBSITE JAVASCRIPT
// =====================================


// 1. SELECT HTML ELEMENTS

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

const courseSelect = document.getElementById("courseSelect");
const planSelect = document.getElementById("planSelect");

const registrationForm = document.getElementById("registrationForm");
const formMessage = document.getElementById("formMessage");

const selectedPlan = document.getElementById("selectedPlan");
const selectedPlanName = document.getElementById("selectedPlanName");
const selectedPlanPrice = document.getElementById("selectedPlanPrice");

const backToTop = document.getElementById("backToTop");


// 2. CONFIGURATION

// Replace these demo details with the client's real details.

const API_URL = "https://dance-fit-backend-cqmz.vercel.app";

const BUSINESS = {
    name: "DanceFit",

    // Replace with the client's real WhatsApp number.
    // Include country code 91, without + or spaces.
    whatsappNumber: "919876543210"
};


// 3. MEMBERSHIP PRICES

const membershipPrices = {
    "Basic Plan": 999,
    "Standard Plan": 2499,
    "Premium Plan": 4499
};


// 4. MOBILE NAVIGATION

function closeMenu() {
    navLinks.classList.remove("open");

    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.setAttribute("aria-label", "Open navigation menu");

    menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
}


menuToggle.addEventListener("click", function () {

    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));

    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
    );

    menuToggle.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';

});


// Close menu when a navigation link is clicked.

document.querySelectorAll("#navLinks a").forEach(function (link) {

    link.addEventListener("click", closeMenu);

});


// Close menu when clicking outside it.

document.addEventListener("click", function (event) {

    if (
        !navLinks.contains(event.target) &&
        !menuToggle.contains(event.target)
    ) {
        closeMenu();
    }

});


// 5. SMOOTH NAVIGATION AND ACTIVE LINK

document.querySelectorAll('a[href^="#"]').forEach(function (link) {

    link.addEventListener("click", function (event) {

        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") {
            return;
        }

        const targetElement = document.querySelector(targetId);

        if (!targetElement) {
            return;
        }

        event.preventDefault();

        targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

});


const pageSections = document.querySelectorAll("main section[id]");
const navigationLinks = document.querySelectorAll(".nav-link");


if ("IntersectionObserver" in window) {

    const sectionObserver = new IntersectionObserver(

        function (entries) {

            entries.forEach(function (entry) {

                if (entry.isIntersecting) {

                    navigationLinks.forEach(function (link) {

                        link.classList.toggle(
                            "active",
                            link.getAttribute("href") === "#" + entry.target.id
                        );

                    });

                }

            });

        },

        {
            rootMargin: "-25% 0px -60% 0px"
        }

    );

    pageSections.forEach(function (section) {

        sectionObserver.observe(section);

    });

}


// 6. MEMBERSHIP PLAN SELECTION

function updateSelectedPlan() {

    const selectedPlanValue = planSelect.value;

    if (!selectedPlanValue) {

        selectedPlan.hidden = true;

        selectedPlanName.textContent = "Not selected";
        selectedPlanPrice.textContent = "₹0";

        return;

    }

    const price = membershipPrices[selectedPlanValue];

    if (typeof price !== "number") {

        selectedPlan.hidden = true;

        return;

    }

    selectedPlan.hidden = false;

    selectedPlanName.textContent = selectedPlanValue;

    selectedPlanPrice.textContent =
        "₹" + price.toLocaleString("en-IN");

}


planSelect.addEventListener("change", updateSelectedPlan);


// 7. CHOOSE MEMBERSHIP BUTTONS

document.querySelectorAll(".plan-btn").forEach(function (button) {

    button.addEventListener("click", function () {

        const planName = button.dataset.plan;

        if (!membershipPrices.hasOwnProperty(planName)) {
            return;
        }

        planSelect.value = planName;

        updateSelectedPlan();

        const joinSection = document.getElementById("join");

        joinSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

});


// 8. COURSE ENROLLMENT BUTTONS

document.querySelectorAll(".enroll-btn").forEach(function (button) {

    button.addEventListener("click", function () {

        const courseName = button.dataset.course;

        const validCourse = Array.from(courseSelect.options).some(
            function (option) {
                return option.value === courseName;
            }
        );

        if (!validCourse) {
            return;
        }

        courseSelect.value = courseName;

        document.getElementById("join").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

});


// 9. FORM MESSAGE HELPER

function showFormMessage(message, type) {

    formMessage.textContent = message;

    formMessage.className = "form-message " + type;

}


// 10. REGISTRATION FORM


 // 10. REGISTRATION FORM WITH RAZORPAY

registrationForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    formMessage.textContent = "";
    formMessage.className = "form-message";

    if (!registrationForm.checkValidity()) {
        registrationForm.reportValidity();
        return;
    }

    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const course = courseSelect.value;
    const plan = planSelect.value;
    const timing = document.getElementById("timing").value;

    if (fullName.length < 2) {
        showFormMessage("Please enter your full name.", "error");
        return;
    }

    if (!/^[6-9][0-9]{9}$/.test(phone)) {
        showFormMessage("Please enter a valid mobile number.", "error");
        return;
    }

    if (!Object.prototype.hasOwnProperty.call(membershipPrices, plan)) {
        showFormMessage("Please select a valid membership plan.", "error");
        return;
    }

    const submitButton = registrationForm.querySelector(
        'button[type="submit"]'
    );

    try {
        submitButton.disabled = true;
        submitButton.textContent = "Creating payment order...";

        if (!window.Razorpay) {
            throw new Error("Payment system could not load. Please refresh the page.");
        }

        // Create payment order on backend
        const orderResponse = await fetch(
           `${API_URL}/api/create-order`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: fullName,
                    phone: phone,
                    email: email,
                    course: course,
                    plan: plan,
                    timing: timing
                })
            }
        );

        const orderData = await orderResponse.json();

        if (!orderResponse.ok || !orderData.success) {
            throw new Error(orderData.message || "Could not create payment order.");
        }

        showFormMessage("Opening secure payment window...", "success");

        const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "DanceFit Studio",
            description: plan + " Membership",
            order_id: orderData.orderId,

            prefill: {
                name: fullName,
                email: email,
                contact: phone
            },

            theme: {
                color: "#ff004f"
            },

            handler: async function (paymentResponse) {
                showFormMessage("Verifying your payment...", "success");

                try {
                    const verifyResponse = await fetch(
                        `${API_URL}/api/verify-payment`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(paymentResponse)
                        }
                    );

                    const verifyData = await verifyResponse.json();

                    if (!verifyResponse.ok || !verifyData.success) {
                        throw new Error(
                            verifyData.message || "Payment verification failed."
                        );
                    }

                    showFormMessage(
                        "Payment successful! Your registration is confirmed.",
                        "success"
                    );

                    registrationForm.reset();
                    updateSelectedPlan();

                } catch (error) {
                    showFormMessage(
                        "Payment was received, but verification or registration needs attention. Please contact the studio and share Payment ID: " +
                        paymentResponse.razorpay_payment_id,
                        "error"
                    );

                    console.error("Payment Verification Error:", error);

                } finally {
                    submitButton.disabled = false;
                    submitButton.innerHTML =
                        'Request Enrollment <i class="fa-solid fa-arrow-right"></i>';
                }
            },

            modal: {
                ondismiss: function () {
                    showFormMessage(
                        "Payment window closed. You can try again.",
                        "error"
                    );

                    submitButton.disabled = false;
                    submitButton.innerHTML =
                        'Request Enrollment <i class="fa-solid fa-arrow-right"></i>';
                }
            }
        };

        const razorpayCheckout = new Razorpay(options);

        razorpayCheckout.on("payment.failed", function (response) {
            showFormMessage(
                response.error.description || "Payment failed. Please try again.",
                "error"
            );

            submitButton.disabled = false;
            submitButton.innerHTML =
                'Request Enrollment <i class="fa-solid fa-arrow-right"></i>';
        });

        razorpayCheckout.open();

    } catch (error) {
        showFormMessage(
            error.message || "Could not connect to the payment server.",
            "error"
        );

        submitButton.disabled = false;
        submitButton.innerHTML =
            'Request Enrollment <i class="fa-solid fa-arrow-right"></i>';

        console.error("Payment Error:", error);
    }
});

// 11. WHATSAPP CONTACT BUTTON

const whatsappContact = document.getElementById("whatsappContact");

const contactMessage = encodeURIComponent(
    "Hello DanceFit! I would like to know more about your women's fitness courses and membership plans."
);

whatsappContact.href =
    "https://wa.me/" +
    BUSINESS.whatsappNumber +
    "?text=" +
    contactMessage;

whatsappContact.target = "_blank";
whatsappContact.rel = "noopener noreferrer";


// 12. BACK TO TOP BUTTON

window.addEventListener("scroll", function () {

    if (window.scrollY > 400) {

        backToTop.classList.add("show");

    } else {

        backToTop.classList.remove("show");

    }

});


backToTop.addEventListener("click", function () {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});


// 13. AUTOMATIC COPYRIGHT YEAR

document.getElementById("currentYear").textContent =
    new Date().getFullYear();


// 14. CONSOLE MESSAGE

console.log(
    BUSINESS.name + " website JavaScript loaded successfully."
);