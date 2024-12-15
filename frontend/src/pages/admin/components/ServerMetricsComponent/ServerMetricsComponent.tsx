import { FC, useCallback, useEffect, useState } from 'react';

import { Box, Button, Divider, Grid2, List, ListItem, ListItemText, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../../../common/helpers/convert-case';
import { useApiGet } from '../../../../shared/hooks/use-api-fetch';

import type { Result } from '../../../../common/types/result';
import type { ServerMetrics, ServerMetricsApi } from '../../../../common/types/admin/server-metrics';

/** Server Metrics Component */
export const ServerMetricsComponent: FC = () => {
  const apiGet = useApiGet();
  
  const [serverMetrics, setServerMetrics] = useState<ServerMetrics>(null);
  
  const onLoadServerMetrics = useCallback(async () => {
    try {
      const response = await apiGet('/admin/server-metrics');
      const result: Result<ServerMetricsApi> = await response.json();
      if(result.error != null) return setServerMetrics(null);
      setServerMetrics(snakeToCamelCaseObject(result.result));
    }
    catch(error) {
      setServerMetrics(null);
      console.error('サーバメトリクス情報の取得に失敗', error);
    }
  }, [apiGet]);
  
  useEffect(() => {
    onLoadServerMetrics();
  }, [onLoadServerMetrics]);
  
  return <>
    <Typography component="h2" variant="h5" sx={{ mt: 3 }}>サーバメトリクス</Typography>
    <Box component="div" sx={{ mt: 3, textAlign: 'right' }}>
      <Button variant="contained" onClick={onLoadServerMetrics}>再読込</Button>
    </Box>
    <List sx={{ mt: 3 }}>
      <Divider component="li" />
      <ListItem alignItems="center" sx={{ px: 0 }}>
        <ListItemText
          primary={
            <Grid2 container spacing={1}>
              <Grid2 size={{ xs: 12, sm: 2 }}>CPU</Grid2>
              <Grid2 size={{ xs:  9, sm: 8 }} sx={{ textAlign: 'right' }}>{serverMetrics?.cpu?.modelName    ?? '-'}</Grid2>
              <Grid2 size={{ xs:  3, sm: 2 }} sx={{ textAlign: 'right' }}>{serverMetrics?.cpu?.usagePercent ?? '-'}<wbr /> %</Grid2>
            </Grid2>
          }
        />
      </ListItem>
      <Divider component="li" />
      <ListItem alignItems="center" sx={{ px: 0 }}>
        <ListItemText
          primary={
            <Grid2 container spacing={1}>
              <Grid2 size={{ xs: 12  , sm: 2 }}>RAM</Grid2>
              <Grid2 size={{ xs:  4.5, sm: 4 }} sx={{ textAlign: 'right' }}><Typography component="span" sx={{ whiteSpace: 'nowrap' }}>{serverMetrics?.ram?.freeGb       ?? '-'}</Typography> <Typography component="span" sx={{ whiteSpace: 'nowrap' }}>GB 空</Typography></Grid2>
              <Grid2 size={{ xs:  4.5, sm: 4 }} sx={{ textAlign: 'right' }}><Typography component="span" sx={{ whiteSpace: 'nowrap' }}>{serverMetrics?.ram?.totalGb      ?? '-'}</Typography> <Typography component="span" sx={{ whiteSpace: 'nowrap' }}>GB 計</Typography></Grid2>
              <Grid2 size={{ xs:  3  , sm: 2 }} sx={{ textAlign: 'right' }}><Typography component="span" sx={{ whiteSpace: 'nowrap' }}>{serverMetrics?.ram?.usagePercent ?? '-'}</Typography> <Typography component="span" sx={{ whiteSpace: 'nowrap' }}>%</Typography></Grid2>
            </Grid2>
          }
        />
      </ListItem>
      <Divider component="li" />
      <ListItem alignItems="center" sx={{ px: 0 }}>
        <ListItemText
          primary={
            <Grid2 container spacing={1}>
              <Grid2 size={{ xs: 12  , sm: 2 }}>Disk</Grid2>
              <Grid2 size={{ xs:  4.5, sm: 4 }} sx={{ textAlign: 'right' }}><Typography component="span" sx={{ whiteSpace: 'nowrap' }}>{serverMetrics?.disk?.freeGb       ?? '-'}</Typography> <Typography component="span" sx={{ whiteSpace: 'nowrap' }}>GB 空</Typography></Grid2>
              <Grid2 size={{ xs:  4.5, sm: 4 }} sx={{ textAlign: 'right' }}><Typography component="span" sx={{ whiteSpace: 'nowrap' }}>{serverMetrics?.disk?.totalGb      ?? '-'}</Typography> <Typography component="span" sx={{ whiteSpace: 'nowrap' }}>GB 計</Typography></Grid2>
              <Grid2 size={{ xs:  3  , sm: 2 }} sx={{ textAlign: 'right' }}><Typography component="span" sx={{ whiteSpace: 'nowrap' }}>{serverMetrics?.disk?.usagePercent ?? '-'}</Typography> <Typography component="span" sx={{ whiteSpace: 'nowrap' }}>%</Typography></Grid2>
            </Grid2>
          }
        />
      </ListItem>
      <Divider component="li" />
    </List>
  </>;
};
