// Copyright 2019 Tad Lebeck
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';
import { Info, Warning } from '@material-ui/icons';

import { ALERT_TYPES } from '../components/AlertMessageConstants';
import './alertmessage.css';

function AlertMessage(props) {
    const { closeAlert, duplicates, level, message } = props;
    const id = level === ALERT_TYPES.ERROR ? 'alertError' : 'alertMessage';
    const iconStyle = { height: '20px', width: '20px' };

    useEffect(() => {
        if (level !== ALERT_TYPES.ERROR && closeAlert) {
            setTimeout(() => {
                closeAlert(message);
            }, 4000);
        }
    });

    return (
        <Alert
            id={id}
            bsStyle={level || ALERT_TYPES.SUCCESS}
            className="alert-message"
            onDismiss={() => closeAlert(message)}
        >
            <div className="alert-message-layout">
                <div className="alert-message-main">
                    <div className="alert-message-icon">
                        {level === ALERT_TYPES.ERROR ? <Warning style={iconStyle} /> : <Info style={iconStyle} />}
                    </div>
                    <div className="alert-message-text">
                        {Array.isArray(message) ? (
                            message.map((value, idx) => {
                                return (
                                    <div id={`${id}-${idx}`} key={idx}>
                                        {value}
                                    </div>
                                );
                            })
                        ) : (
                            <div id={id}>{message}</div>
                        )}
                    </div>
                </div>
                {duplicates > 0 ? <div className="alert-message-duplicates">{duplicates + 1}</div> : null}
            </div>
        </Alert>
    );
}

AlertMessage.propTypes = {
    closeAlert: PropTypes.func.isRequired,
    duplicates: PropTypes.number,
    level: PropTypes.string,
    message: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
};

AlertMessage.defaultProps = {
    duplicates: 0,
};

export default AlertMessage;
