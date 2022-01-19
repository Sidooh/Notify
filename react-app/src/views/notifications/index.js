// material-ui
import { Grid, IconButton } from "@mui/material";
import MUIDataTable from "mui-datatables";
import DeleteIcon from "@mui/icons-material/Delete";

// project imports
import MainCard from "ui-component/cards/MainCard";
import SecondaryAction from "ui-component/cards/CardSecondaryAction";
import { gridSpacing } from "store/constant";
import { useEffect, useState } from "react";
import { NotificationService } from "../../services/notification.service";

const Notifications = () => {
    const [notifications, setNotifications] = useState(null);

    const columns = ["Channel", "Message", "Destination", "Provider", "Status", "Actions"];

    useEffect(async () => {
        const response = await NotificationService.index();

        const data = response.map(notification => [
            notification.channel,
            notification.content,
            notification.destination.join(', '),
            notification.provider,
            notification.status,
            () => (
                <>
                    <IconButton aria-label="delete" size={'small'} color={'error'}>
                        <DeleteIcon />
                    </IconButton>
                    <IconButton aria-label="delete" size={'small'} color={'error'}>
                        <DeleteIcon />
                    </IconButton>
                </>
            )
        ]);

        setNotifications(data);
    }, []);

    return (
        <MainCard title='Notifications'
                  secondary={<SecondaryAction link='https://next.material-ui.com/system/shadows/' />}>
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    {notifications && <MUIDataTable data={notifications} columns={columns} options={{ filterType: "checkbox" }} />}
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default Notifications;
