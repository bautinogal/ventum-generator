import React, { memo } from 'react';
import { CircularProgress, Dialog, DialogContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const MyCircularProgress = memo((props) => {
    const { fetching } = props;
    console.log(props)
    return (<Dialog open={fetching > 0}
        PaperProps={{ style: { backgroundColor: 'transparent', boxShadow: 'none' } }}
        BackdropProps={{ sx: { backgroundColor: 'rgba(0, 0, 0, 0.75)', } }}
    >
        <DialogContent sx={{ backgroundColor: 'transparent', overflow: "hidden" }}>
            <CircularProgress sx={{ color: 'var(--primary-contrastText) !important' }} />
        </DialogContent>
    </Dialog>);
}, (prevProps, nextProps) => {
    // Solo re-renderizar si `fetching` cambia de >= 0 a < 0 o viceversa.
    const wasPositiveOrZero = prevProps.fetching >= 0;
    const isPositiveOrZero = nextProps.fetching >= 0;
    return wasPositiveOrZero === isPositiveOrZero;
});

export default MyCircularProgress;