import * as React from "react";

// material-ui
// project imports
import { useLocation } from "react-router-dom";
import {
    CardContent,
    Chip,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Typography
} from "@mui/material";
import { gridSpacing } from "../../store/constant";
import MainCard from "../../ui-component/cards/MainCard";
import { AccessTime, Autorenew, MiscellaneousServices, WifiChannel } from "@mui/icons-material";
import CircularLoadingBtn from "../../components/CircularLoadingBtn";
import { NotificationChipArray } from "./index";
import moment from "moment";
import { Help } from "../../utils/helpers.utils";

const DetailSection = ({ notification, hasError, retryNotification }) => {
    let date;
    if (Help.isToday(moment(notification.created_at))) {
        date = "Today";
    } else if (Help.isYesterday(moment(notification.created_at))) {
        date = "Yesterday";
    } else {
        date = moment(notification.created_at).format("D.M.y");
    }

    return (
        <MainCard content={false}>
            <CardContent>
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12}>
                        <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
                              subheader={<ListSubheader>DETAILS</ListSubheader>}>
                            <ListItem>
                                <ListItemIcon><WifiChannel /></ListItemIcon>
                                <ListItemText id="switch-list-label-bluetooth" primary="Channel"
                                              secondary={notification.channel} />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><MiscellaneousServices /></ListItemIcon>
                                <ListItemText id="switch-list-label-bluetooth" primary="Provider"
                                              secondary={notification.provider} />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><Autorenew /></ListItemIcon>
                                <ListItemText id="switch-list-label-wifi" primary="Status" secondary={
                                    <React.Fragment>
                                        <Chip size={"small"} color={hasError ? "error" : "success"}
                                              label={_.upperFirst(notification.status)}
                                              variant="outlined" />
                                    </React.Fragment>
                                } />
                                {hasError && <IconButton aria-label="delete" size={"small"} color={"error"}
                                                         onClick={() => retryNotification(notification)}>
                                    <CircularLoadingBtn title={"retry"} />
                                </IconButton>}
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><AccessTime /></ListItemIcon>
                                <ListItemText id="switch-list-label-bluetooth"
                                              secondary={
                                                  <React.Fragment>
                                                      <div style={{ textAlign: "end" }}>
                                                          <strong>{moment(notification.created_at)
                                                              .format("LTS")}</strong><br />
                                                          <Typography variant={"caption"}>{date}</Typography>
                                                      </div>
                                                  </React.Fragment>
                                              } />
                            </ListItem>
                        </List>
                    </Grid>
                </Grid>
            </CardContent>
        </MainCard>
    );
};

const ContentSection = ({ notification }) => {
    return (
        <MainCard>
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    <Grid container alignItems="center" justifyContent="space-between">
                        <Grid item>
                            <Grid container direction="column" spacing={1}>
                                <Grid item>
                                    <Typography variant="body1" color={"gray"}>DESTINATION(S)</Typography>
                                </Grid>
                                <Grid item>
                                    <NotificationChipArray notification={notification} />
                                </Grid>
                            </Grid>
                        </Grid>
                        <hr width={"100%"} />
                        <Grid item>
                            <Grid container direction="column" spacing={1}>
                                <Grid item>
                                    <Typography variant="body1" color={"gray"}>Message</Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant="body2">{notification.content}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </MainCard>
    );
};

const CallbackSection = ({ notification }) => {
    return (
        <MainCard>
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    <Grid container alignItems="center" justifyContent="space-between">
                        <Grid item>
                            <Grid container direction="column" spacing={1}>
                                <Grid item>
                                    <Typography variant="body1" color={"gray"}>CALLBACK</Typography>
                                </Grid>
                                <Grid item>
                                    <NotificationChipArray notification={notification} />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </MainCard>
    );
};

const NotificationView = () => {
    let { state } = useLocation(),
        notification = state;
    console.log(notification);

    let hasError;
    if (notification.channel === "sms" && notification.notifiable_id) {
        hasError = notification.notifiable_id.data.some(recipient => recipient.status !== "success");
    } else {
        hasError = notification.status !== "success";
    }

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12} md={4}>
                <DetailSection notification={notification} hasError={hasError}
                               retryNotification={() => {
                               }} />
            </Grid>
            <Grid item xs={12} md={8}>
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12}>
                        <ContentSection notification={notification} />
                    </Grid>
                    {notification.notifiable_id && <Grid item xs={12}>
                        <CallbackSection notification={notification} />
                    </Grid>}
                </Grid>
            </Grid>
        </Grid>
    );
};

export default NotificationView;
