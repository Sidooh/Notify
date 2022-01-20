// material-ui
import { Chip, Grid, Typography } from "@mui/material";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";


// project imports
import MainCard from "ui-component/cards/MainCard";
import SecondaryAction from "ui-component/cards/CardSecondaryAction";
import { gridSpacing } from "store/constant";
import { useEffect, useState } from "react";
import { NotificationService } from "../../services/notification.service";
import { Mail, Telegram } from "@mui/icons-material";
import { IconBrandSlack } from "@tabler/icons";
import moment from "moment";

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
                },
            }
        }
    }
});

const ChipArray = ({ destinations, channel }) => {
    return (
        <>
            {destinations.map((dest, i) => {
                let icon;

                if (channel === "mail") {
                    icon = <Mail fontSize={"small"} style={{ paddingLeft: "7px" }} />;
                } else if (channel === "sms") {
                    icon = <Telegram fontSize={"small"} style={{ paddingLeft: "7px" }} />;
                } else {
                    icon = <IconBrandSlack size={20} style={{ paddingLeft: "7px" }} />;
                }

                return (
                    <Chip key={i} size={"small"} variant={"outlined"}
                          icon={icon} style={{ margin: "1px" }}
                          label={dest} color={"secondary"}
                          onClick={() => console.log(dest)} />
                );
            })}
        </>
    );
};


const Notifications = () => {
    const [notifications, setNotifications] = useState(null);

    useEffect(async () => {
        const response = await NotificationService.index();

        const data = response.map(notification => {
            return [
                <Typography variant={'body2'} fontWeight={'bold'}>{notification.channel.toUpperCase()}</Typography>,
                <Typography variant={"body2"} style={{
                    display: "-webkit-box",
                    overflow:'hidden',
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2
                }}>{notification.content}</Typography>,
                <ChipArray destinations={notification.destination} channel={notification.channel} />,
                <Typography variant={'body2'} fontWeight={'bold'}>{notification.provider}</Typography>,
                <Chip size={"small"} color={notification.status === "success" ? "success" : "error"}
                      label={notification.status} />,
                <div style={{textAlign:'end'}}>
                    <strong>{moment(notification.created_at).format('LTS')}</strong><br/>
                    <Typography variant={'caption'}>{moment(notification.created_at).format('D.M.y')}</Typography>
                </div>,
            ];
        });

        setNotifications(data);
    }, []);

    return (<MainCard title='Notifications'
                      secondary={<SecondaryAction link='https://next.material-ui.com/system/shadows/' />}>
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                {
                    notifications &&
                    <ThemeProvider theme={theme}>
                        <MUIDataTable data={notifications}
                                      columns={[
                                          { name: "CHANNEL" },
                                          "MESSAGE",
                                          "DESTINATION(S)",
                                          "PROVIDER",
                                          "STATUS",
                                          { name: "DATE" }
                                      ]}
                                      options={{ filterType: "checkbox" }} />
                    </ThemeProvider>
                }
            </Grid>
        </Grid>
    </MainCard>);
};

export default Notifications;
