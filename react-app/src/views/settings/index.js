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
import Popup from "../../components/Popup";
import SettingsForm from "../../ui-component/forms/SettingsForm";

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
    const [settingForEdit, setSettingForEdit] = useState(null);
    const [openPopup, setOpenPopup] = useState(false);

    useEffect(async () => {
        await initTable();
    }, []);

    const initTable = async () => {
        const response = await SettingService.all();

        const tableData = response.map(setting => {
            return [
                <Typography variant={"body2"} fontWeight={"bold"}>{setting.type.toUpperCase()}</Typography>,
                <Typography variant={"body2"}>{setting.value.toUpperCase()}</Typography>,
                () => (<>
                    <IconButton onClick={() => openInPopup(setting)} aria-label="delete" size={"small"}
                                color={"primary"}>
                        <Edit />
                    </IconButton>
                    <IconButton aria-label="delete" size={"small"} color={"error"}>
                        <Delete />
                    </IconButton>
                </>)
            ];
        });

        setSettings(tableData);
    };

    const updateOrCreate = async (setting, resetForm) => {
        Boolean(setting.id)
            ? await SettingService.update(setting)
            : await SettingService.create(setting);

        setOpenPopup(false);
        resetForm();

        await initTable();
    };

    const openInPopup = setting => {
        setSettingForEdit(setting);
        setOpenPopup(true);
    };

    return (
        <MainCard title="Settings"
                  secondary={<SecondaryAction link="https://next.material-ui.com/system/shadows/" />}>
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

            <Popup open={openPopup} size={"xs"} setOpen={setOpenPopup}
                   title={(settingForEdit ? "Update" : "New") + " Setting"}>
                <SettingsForm setting={settingForEdit} showPopup={setOpenPopup} updateOrCreate={updateOrCreate} />
            </Popup>
        </MainCard>
    );
};

export default Notifications;
