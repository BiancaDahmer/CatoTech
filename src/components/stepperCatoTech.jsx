import { Stepper, Step, StepLabel, Box } from "@mui/material";

export default function StepperCatoTech({ activeStep }) {
  const steps = ["Dados do Cliente", "Cotação", "Resumo", "Envio"];

  return (
    <Box sx={{ mb: 4 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
