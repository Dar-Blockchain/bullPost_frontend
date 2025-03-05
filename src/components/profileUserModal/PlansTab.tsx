import React from "react";
import {
  Box, Typography, Button,
  useMediaQuery,

} from "@mui/material";

interface Plan {
  title: string;
  price: string;
  features: string[];
}
const PlansTab: React.FC = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const plans: Plan[] = [
    {
      title: "Standard",
      price: "$30",
      features: [
        "Social Sync Agent",
        "Formatting Agent",
        "Content Optimizer",
        "Multilingual Agent",
      ],
    },
    {
      title: "Image AI Agent",
      price: "$60",
      features: [
        "Image Agent",
        "MEME Agent",
        "Image Agent",
        "AI Training",
      ],
    },
    {
      title: "Video AI Agent",
      price: "$90",
      features: [
        "Faceless Video Agent",
        "UGC Video Agent",
        "AI Orchestrator Chatbot",
        "Autopilot AI Agent",
      ],
    },
  ];
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        borderRadius: "12px",
      }}
    >


      <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", justifyContent: "center", width: "100%", gap: 4 }}>
        {plans.map((plan, index) => (
          <Box
            key={index}
            sx={{
              padding: 3,
              borderRadius: "10px",
              textAlign: "start",
              mt: 3,
              width: 260,
              height: 315,
              borderWidth: 1,
            }}
          >
            <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#FFB300" }}>
              {plan.title}
            </Typography>
            <Typography sx={{ fontSize: "40px", color: "#fff", mt: 1, fontWeight: "bold" }}>
              {plan.price.split(' ')[0]} <span style={{ fontSize: "20px" }}>/ month</span>
            </Typography>
            <Box sx={{ mt: 2, color: "#aaa" }}>
              {plan.features.map((feature: any, i: any) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <img src="/check_circle.svg" alt="check" width={16} height={16} style={{ marginRight: 8 }} />
                  <Typography sx={{ fontSize: "14px" }}>{feature}</Typography>
                </Box>
              ))}
            </Box>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                borderWidth: 1,
                borderRadius: "10px",
                borderColor: "#FFB300",
                borderStyle: "solid",
                padding: "10px",
                backgroundColor: "#111",
                color: "#FFB300",
                mt: 5,
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#FFB300", color: "#111" },
              }}
            >
              Select
            </Button>
          </Box>
        ))}
      </Box>

    </Box>
  );
};

export default PlansTab;
