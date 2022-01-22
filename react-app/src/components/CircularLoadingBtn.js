import { useEffect, useRef, useState } from "react";
import { green } from "@mui/material/colors";
import { Box, CircularProgress, IconButton } from "@mui/material";
import { Check, Refresh } from "@mui/icons-material";

const CircularLoadingBtn = ({ title, onClick }) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const timer = useRef();

    const buttonSx = {
        ...(success && {
            bgcolor: green[500],
            "&:hover": {
                bgcolor: green[700]
            }
        })
    };

    useEffect(() => {
        return () => clearTimeout(timer.current)
    }, []);

    const handleButtonClick = () => {
        if (!loading) {
            setSuccess(false);
            setLoading(true);
            timer.current = window.setTimeout(() => {
                setSuccess(true);
                setLoading(false);
            }, 3000);
        }

        onClick();
    };

    return (
        <Box sx={{ display: "inline-flex", position: "relative", alignItems: "center" }}>
            <IconButton title={title} onClick={handleButtonClick} sx={buttonSx} size={"small"}
                        color={"primary"}>
                {success ? <Check fontSize={"small"} style={{ color: "white" }} /> : <Refresh fontSize={"small"} />}
            </IconButton>
            {loading && (
                <CircularProgress
                    size={30} sx={{ color: green[500], position: "absolute", top: 0, left: 0, zIndex: 1 }} />
            )}
        </Box>
    );
};

export default CircularLoadingBtn