// material-ui
import { Box, Chip, Grid, IconButton, LinearProgress, Typography } from "@mui/material";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Mail, ReadMore, Telegram } from "@mui/icons-material";

// project imports
import MainCard from "ui-component/cards/MainCard";
import SecondaryAction from "ui-component/cards/CardSecondaryAction";
import { gridSpacing } from "store/constant";
import { useEffect, useState } from "react";
import { NotificationService } from "../../services/notification.service";
import { IconBrandSlack } from "@tabler/icons";
import moment from "moment";
import { Help } from "../../utils/helpers.utils";
import CircularLoadingBtn from "../../components/CircularLoadingBtn";
import { Link } from "react-router-dom";

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

export const NotificationChipArray = ({ notification }) => {
    let data, icon;
    if (notification.channel === "sms" && notification.notifiable_id) {
        data = notification.notifiable_id.data.map(notif => ({ ...notif, recipient: notif.phone }));
    } else {
        data = notification.destination.map(notif => ({ recipient: notif, status: notification.status }));
    }

    if (notification.channel === "mail") {
        icon = <Mail fontSize={"small"} style={{ paddingLeft: "7px" }} />;
    } else if (notification.channel === "sms") {
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

    const fetchData = async () => {
        const response = await NotificationService.index();

        setNotifications(buildTable(response));
    };

    useEffect(() => fetchData(), []);

    function buildTable(data) {
        const retryNotification = notification => {
            NotificationService.retry(notification).then(async response => {
                if (response) await fetchData();
            });
        };

        return data.map(notification => {
            let date;
            if (Help.isToday(moment(notification.created_at))) {
                date = "Today";
            } else if (Help.isYesterday(moment(notification.created_at))) {
                date = "Yesterday";
            } else {
                date = moment(notification.created_at).format("D.M.y");
            }

            let hasError;
            if (notification.channel === "sms" && notification.notifiable_id) {
                hasError = notification.notifiable_id.data.some(recipient => recipient.status !== "success");
            } else {
                hasError = notification.status !== "success";
            }

            return [
                <Typography variant={"body2"} fontWeight={"bold"}>{notification.channel.toUpperCase()}</Typography>,
                <Typography variant={"body2"} title={notification.content} style={{
                    display: "-webkit-box",
                    overflow: "hidden",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    cursor: "context-menu"
                }}>{notification.content}</Typography>,
                <NotificationChipArray notification={notification} />,
                <Typography variant={"body2"} fontWeight={"bold"}>{notification.provider}</Typography>,
                <div style={{ textAlign: "end" }}>
                    <strong>{moment(notification.created_at).format("LTS")}</strong><br />
                    <Typography variant={"caption"}>{date}</Typography>
                </div>,
                () => (
                    <>
                        <Link to={"/notifications/show"} state={notification}><ReadMore /></Link>
                        {hasError && <IconButton aria-label="delete" size={"small"} color={"error"}
                                                 onClick={() => retryNotification(notification)}>
                            <CircularLoadingBtn title={"retry"} />
                        </IconButton>}
                    </>
                )
            ];
        });
    }

    return (<MainCard title="Notifications"
                      secondary={<SecondaryAction link="https://next.material-ui.com/system/shadows/" />}>
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <ThemeProvider theme={theme}>
                    {!notifications
                        ? <Grid container alignItems="center" justifyContent="center">
                            <Grid item width={'70%'}>
                                <Box sx={{ width: '100%' }}>
                                    <LinearProgress color={'secondary'}/>
                                </Box>
                            </Grid>
                        </Grid>
                        : <MUIDataTable data={notifications}
                                        columns={[
                                            { name: "CHANNEL" },
                                            "MESSAGE",
                                            "DESTINATION(S)",
                                            "PROVIDER",
                                            { name: "DATE" },
                                            "ACTIONS"
                                        ]}
                                        options={{ filterType: "checkbox" }} />}

                </ThemeProvider>
            </Grid>
        </Grid>
    </MainCard>);
};

export default Notifications;
