// const users = [
//   {
//     username: "tanvi_kuwar",
//     password: "tanvi@123", // (hash this in real apps)
//     profile_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
//   },
//   {
//     username: "rahul_dev",
//     password: "rahul@123",
//     profile_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
//   },
//   {
//     username: "neha_codes",
//     password: "neha@123",
//     profile_image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2"
//   }
// ];

// module.exports = {users};


const users = [
  {
    fullName: "Ramesh Kumar",
    phone: "9876543210",
    email: "ramesh@example.com",
    business: "Kumar Agro Products",
    businessType: "Farmer",
    password: "Ramesh123", // plain password for now
    role: "user",
  },
  {
    fullName: "Sita Sharma",
    phone: "9123456780",
    email: "sita@example.com",
    business: "Sharma Trading Co.",
    businessType: "Trader",
    password: "Sita1234",
    role: "user",
  },
  {
    fullName: "Amit Verma",
    phone: "9988776655",
    email: "amit@example.com",
    business: "Verma Exports",
    businessType: "Exporter",
    password: "Amit1234",
    role: "admin",
  },
];

module.exports = { users };
