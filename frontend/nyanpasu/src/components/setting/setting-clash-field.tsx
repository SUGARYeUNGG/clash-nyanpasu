import { Box, Typography } from "@mui/material";
import { useClash } from "@nyanpasu/interface";
import { BaseCard, BaseDialog } from "@nyanpasu/ui";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import CLASH_FIELD from "@/assets/json/clash-field.json";
import { ClashFieldItem, LabelSwitch } from "./modules/clash-field";
import Grid from "@mui/material/Unstable_Grid2";

const FieldsControl = ({
  label,
  fields,
  enabledFields,
  onChange,
}: {
  label: string;
  fields: { [key: string]: string };
  enabledFields?: string[];
  onChange?: (key: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  // Nyanpasu Control Fields object key
  const disabled = label === "default" || label === "handle";

  const showFields: string[] = disabled
    ? Object.entries(fields).map(([key]) => key)
    : (enabledFields as string[]);

  const Item = () => {
    return Object.entries(fields).map(([fKey, fValue], fIndex) => {
      const checked = enabledFields?.includes(fKey);

      return (
        <LabelSwitch
          key={fIndex}
          label={fKey}
          url={fValue}
          disabled={disabled}
          checked={disabled ? true : checked}
          onChange={onChange ? () => onChange(fKey) : undefined}
        />
      );
    });
  };

  return (
    <>
      <ClashFieldItem
        label={label}
        fields={showFields}
        onClick={() => setOpen(true)}
      />

      <BaseDialog
        title={label}
        open={open}
        close="Close"
        onClose={() => setOpen(false)}
        divider
        contentSx={{ overflow: "auto" }}
      >
        <Box display="flex" flexDirection="column" gap={1}>
          {disabled && <Typography>Clash Nyanpasu Control Fields.</Typography>}

          <Item />
        </Box>
      </BaseDialog>
    </>
  );
};

export const SettingClashField = () => {
  const { t } = useTranslation();

  const { getRuntimeExists, getProfiles, setProfilesConfig } = useClash();

  const mergeFields = useMemo(
    () => [
      ...(getRuntimeExists.data ?? []),
      ...(getProfiles.data?.valid ?? []),
    ],
    [getRuntimeExists.data, getProfiles.data],
  );

  const filteredField = (fields: { [key: string]: string }): string[] => {
    const usedObjects = [];

    for (const key in fields) {
      if (fields.hasOwnProperty(key) && mergeFields.includes(key)) {
        usedObjects.push(key);
      }
    }

    return usedObjects;
  };

  const updateFiled = async (key: string) => {
    const getFileds = (): string[] => {
      const valid = getProfiles.data?.valid ?? [];

      if (valid.includes(key)) {
        return valid.filter((item) => item !== key);
      } else {
        valid.push(key);

        return valid;
      }
    };

    await setProfilesConfig({ valid: getFileds() });
  };

  return (
    <BaseCard label={t("Clash Field")}>
      <Grid container spacing={2}>
        {Object.entries(CLASH_FIELD).map(([key, value], index) => {
          const filltered = filteredField(value);

          return (
            <FieldsControl
              key={index}
              label={key}
              fields={value}
              enabledFields={filltered}
              onChange={updateFiled}
            />
          );
        })}
      </Grid>
    </BaseCard>
  );
};

export default SettingClashField;
