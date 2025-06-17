import { Button } from "@mui/material";
import { House } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const SupporthTML = `
    
    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Privacy Policy | Evoapp </title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
</head>

<body class="bg-white">

    <div class="min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-16">
        <div class="max-w-3xl mx-auto space-y-10">

            <!-- Header -->
            <header class="text-center">
                <p class="text-sm text-gray-500 mt-3">Last Updated: June 14, 2025</p>
            </header>

            <!-- Section 1 -->
            <section class="space-y-4">
                <h2 class="text-xl font-semibold text-gray-800">1. Key Points</h2>
                <ul class="list-disc list-inside text-gray-700 space-y-2 text-justify">
                    <li><strong>For Employees:</strong> Your employer (the jewelry store) controls your data and app
                        usage.</li>
                    <li><strong>For Customers:</strong> Your data is managed by the jewelry store; we process it for
                        them. Refer to their privacy policy.</li>
                </ul>
            </section>

            <!-- Section 2 -->
            <section class="space-y-4">
                <h2 class="text-xl font-semibold text-gray-800">2. Data We Collect</h2>
                <ul class="list-disc list-inside text-gray-700 space-y-2 text-justify">
                    <li><strong>From Employees:</strong> Login details, device info for access, and your app
                        interactions.</li>
                    <li><strong>About Customers (for the store):</strong> Registration info, session details (products,
                        cart), remarks, and feedback.</li>
                    <li><strong>Automatically:</strong> App usage, device info, connection status, and system logs.</li>
                </ul>
            </section>

            <!-- Section 3 -->
            <section class="space-y-4">
                <h2 class="text-xl font-semibold text-gray-800">3. How We Use Data</h2>
                <ul class="list-disc list-inside text-gray-700 space-y-2 text-justify">
                    <li><strong>App Functionality:</strong> Employee login, customer management, product interactions,
                        billing, counter coordination, and ERP data sync.</li>
                    <li><strong>App Improvement/Security:</strong> Performance analysis, fraud prevention, reporting,
                        and legal compliance.</li>
                </ul>
            </section>

            <!-- Section 4 -->
            <section class="space-y-4">
                <h2 class="text-xl font-semibold text-gray-800">4. How We Share Data</h2>
                <ul class="list-disc list-inside text-gray-700 space-y-2 text-justify">
                    <li><strong>Your Employer:</strong> All app data is primarily shared with the jewelry store.</li>
                    <li><strong>ERP System:</strong> For seamless integration.</li>
                    <li><strong>Service Providers:</strong> Third parties who help us run the app.</li>
                    <li><strong>Legal Reasons:</strong> When legally required.</li>
                    <li><strong>Business Changes:</strong> In case of mergers or sales.</li>
                </ul>
            </section>

            <!-- Section 5 -->
            <section class="space-y-4">
                <h2 class="text-xl font-semibold text-gray-800">5. Security & Contact</h2>
                <p class="text-gray-700">
                    <strong>Security:</strong> We take reasonable steps to protect your data.<br />
                    <strong>Retention:</strong> Data is kept as long as needed for services and legal reasons.<br />
                    <strong>Employee Rights:</strong> Contact your employer for data-related requests.
                </p>
                <p class="text-gray-700">
                    <strong>Questions?</strong> Contact us:
                </p>
                <ul class="text-gray-700 space-y-1">
                    <li>Email Support: <a href="mailto:support@orail.in" class="hover:underline"
                            style="color: #B937A7;">support@orail.in</a></li>

                    <li>Phone Support: <a href="tel:02613603500" class="hover:underline"
                            style="color: #B937A7;">0261-3603500</a>
                    </li>
                </ul>
            </section>

        </div>
    </div>

</body>

</html>
    `;
  return (
    <>
      <div className="Header_main">
        <div className="header-container">
          <p className="header_title">Evo App Privacy Policy</p>
          <div style={{ display: "flex", gap: "15px" }}>
            <Button
              className="AddCustomer_Btn"
              onClick={() => navigate("/")}
              variant="contained"
            >
              <House />
            </Button>
          </div>
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: SupporthTML }}></div>
    </>
  );
};

export default PrivacyPolicy;
