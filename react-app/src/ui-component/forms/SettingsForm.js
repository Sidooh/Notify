import React, { useEffect, useState } from "react";
import { Autocomplete, Button, Grid, TextField } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { settingOptions } from "../../components/commonTagOptions";

const validationSchema = yup.object({
    type: yup
        .string("Enter setting type")
        .required("Setting type is required."),
    value: yup
        .array("Must be an array").of(yup.string()).ensure()
});

const SettingsForm = ({ showPopup, updateOrCreate, setting }) => {
    const [settingValues, setSettingValues] = useState([]);

    useEffect(() => {
        if (setting.type) setSettingValues(getSettingValuesByName(setting.type));
    }, []);

    const formik = useFormik({
        initialValues: {
            id: setting?.id,
            type: setting?.type ?? "",
            value: setting?.value ?? ""
        },
        validationSchema: validationSchema,
        onSubmit: (values, { resetForm }) => updateOrCreate(values, resetForm)
    });

    const getSettingValuesByName = type => {
        let setting = settingOptions.filter(a => a.type === type);

        return setting[0].values ?? [];
    };

    return (
        <>
            <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Autocomplete name={"level"} options={settingOptions.map(opt => opt.type)} freeSolo
                                      value={formik.values.type}
                                      onChange={(event, newValue) => {
                                          const settingValues = getSettingValuesByName(newValue);
                                          setSettingValues(settingValues);
                                          formik.setFieldValue("type", newValue, true);
                                      }}
                                      renderInput={(params) => (
                                          <TextField{...params} variant="standard" size={"small"} label="Name"
                                                    placeholder="Setting type..." value={formik.values.type}
                                                    error={formik.touched.type && Boolean(formik.errors.type)}
                                                    helperText={formik.touched.type && formik.errors.type} />
                                      )}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Autocomplete name={"level"} options={settingValues} freeSolo
                                      value={formik.values.value}
                                      onChange={(event, newValue) => formik.setFieldValue("value", newValue, true)}
                                      renderInput={(params) => (
                                          <TextField{...params} variant="standard" size={"small"} label="Name"
                                                    placeholder="Setting value..." value={formik.values.value}
                                                    error={formik.touched.value && Boolean(formik.errors.value)}
                                                    helperText={formik.touched.value && formik.errors.value} />
                                      )}
                        />
                    </Grid>
                    <Grid item xs={12} textAlign={"end"}>
                        <Button size={"small"} color={"secondary"} onClick={() => showPopup(false)}>Cancel</Button>
                        <Button variant={"contained"} type={"submit"} color={"primary"}>{setting
                            ? "Update"
                            : "Create"}</Button>
                    </Grid>
                </Grid>
            </form>
        </>
    );
};

export default SettingsForm;