// material-ui
import { Chip, Grid, IconButton, Typography } from "@mui/material";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";


// project imports
import MainCard from "ui-component/cards/MainCard";
import SecondaryAction from "ui-component/cards/CardSecondaryAction";
import { gridSpacing } from "store/constant";
import { useEffect, useState } from "react";
import { NotificationService } from "../../services/notification.service";
import { Delete, Mail, Refresh, Telegram } from "@mui/icons-material";
import { IconBrandSlack } from "@tabler/icons";
import moment from "moment";
import { Help } from "../../utils/helpers.utils";

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

const ChipArray = ({ notification, channel }) => {
    let data, icon;
    if (channel === "sms" && notification.notifiable_id) {
        data = notification.notifiable_id.data.map(notif => ({ ...notif, recipient: notif.phone }));
    } else {
        data = notification.destination.map(notif => ({ recipient: notif, status: notification.status }));
    }

    if (channel === "mail") {
        icon = <Mail fontSize={"small"} style={{ paddingLeft: "7px" }} />;
    } else if (channel === "sms") {
        icon = <Telegram fontSize={"small"} style={{ paddingLeft: "7px" }} />;
    } else {
        icon = <IconBrandSlack size={20} style={{ paddingLeft: "7px" }} />;
    }

    return (
        <>
            {data.map((data, i) => {
                return (
                    <Chip key={i} size={"small"} variant={"outlined"}
                          icon={icon} style={{ margin: "1px" }}
                          label={data.recipient} color={data.status === "success" ? "success" : "error"}
                          onClick={() => console.log(data)} />
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
            let date;
            if (Help.isToday(moment(notification.created_at))) {
                date = "Today";
            } else if (Help.isYesterday(moment(notification.created_at))) {
                date = "Yesterday";
            } else {
                date = moment(notification.created_at).format("D.M.y");
            }

            return [
                <Typography variant={"body2"} fontWeight={"bold"}>{notification.channel.toUpperCase()}</Typography>,
                <Typography variant={"body2"} style={{
                    display: "-webkit-box",
                    overflow: "hidden",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2
                }}>{notification.content}</Typography>,
                <ChipArray notification={notification} channel={notification.channel} />,
                <Typography variant={"body2"} fontWeight={"bold"}>{notification.provider}</Typography>,
                <div style={{ textAlign: "end" }}>
                    <strong>{moment(notification.created_at).format("LTS")}</strong><br />
                    <Typography variant={"caption"}>
                        {date}
                    </Typography>
                </div>,
                () => (<>
                    <IconButton aria-label='delete' size={"small"} color={"primary"}>
                        <Refresh />
                    </IconButton>
                    <IconButton aria-label='delete' size={"small"} color={"error"}>
                        <Delete />
                    </IconButton>
                </>)
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
                                          { name: "DATE" },
                                          "ACTIONS"
                                      ]}
                                      options={{ filterType: "checkbox" }} />
                    </ThemeProvider>
                }
            </Grid>
        </Grid>
    </MainCard>);
};

export default Notifications;
