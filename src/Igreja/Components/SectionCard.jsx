import { Box, Typography } from "@mui/material";

const SectionCard = ({ title, subtitle, children, sx = {}, ...props }) => {
    return (
        <Box
            {...props}
            sx={{
                width: "100%",
                p: { xs: 2, md: 3 },
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                backgroundColor: "background.paper",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
                ...sx,
            }}
        >
            {(title || subtitle) && (
                <Box sx={{ mb: 2 }}>
                    {title && (
                        <Typography variant="h6" fontWeight={700}>
                            {title}
                        </Typography>
                    )}

                    {subtitle && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            )}

            {children}
        </Box>
    );
};

export default SectionCard;