// material-ui
import { Grid, IconButton, Typography } from "@mui/material";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// project imports
import MainCard from "ui-component/cards/MainCard";
import SecondaryAction from "ui-component/cards/CardSecondaryAction";
import { gridSpacing } from "store/constant";
import { useEffect, useState } from "react";
import { Delete, Edit } from "@mui/icons-material";
import { SettingService } from "../../services/setting.service";

const theme = createTheme({
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    fontFamily: `'Varela Round', cursive`,
                    fontWeight: "bold"
                }
            }
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    fontFamily: `'Varela Round', cursive`
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontFamily: `'Varela Round', cursive`
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    maxWidth: "13rem",
                    fontFamily: `'Varela Round', cursive`
                }
            }
        }
    }
});

const Notifications = () => {
    const [settings, setSettings] = useState(null);

    useEffect(async () => {
        const response = await SettingService.index();

        const data = response.map(setting => {
            return [
                <Typography variant={"body2"} fontWeight={"bold"}>{setting.type.toUpperCase()}</Typography>,
                <Typography variant={"body2"}>{setting.value.toUpperCase()}</Typography>,
                () => (<>
                    <IconButton aria-label='delete' size={"small"} color={"primary"}>
                        <Edit/>
                    </IconButton>
                    <IconButton aria-label='delete' size={"small"} color={"error"}>
                        <Delete />
                    </IconButton>
                </>)
            ];
        });

        setSettings(data);
    }, []);

    return (<MainCard title='Settings'
                      secondary={<SecondaryAction link='https://next.material-ui.com/system/shadows/' />}>
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                {
                    settings &&
                    <ThemeProvider theme={theme}>
                        <MUIDataTable data={settings}
                                      columns={[
                                          { name: "TYPE" },
                                          "VALUE",
                                          { name: "ACTIONS" }
                                      ]}
                                      options={{ filterType: "checkbox" }} />
                    </ThemeProvider>
                }
            </Grid>
        </Grid>
    </MainCard>);
};

export default Notifications;
