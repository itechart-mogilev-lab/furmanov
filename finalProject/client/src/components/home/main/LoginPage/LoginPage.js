import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import AdminLoginContainer from '../../../../containers/AdminLoginContainer';
import UserLoginContainer from '../../../../containers/UserLoginContainer';
import ExecutorLoginContainer from '../../../../containers/ExecutorLoginContainer';

function TabContainer({ children, dir, component="div" }) {
  return (
    <Typography component={component} dir={dir} style={{ padding: 8 * 3 }}>
      {children}
    </Typography>
  );
}

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: 700,
    marginTop:theme.spacing.unit * 2,
    marginLeft:'auto',
    marginRight:'auto',
  },
});

class LoginPage extends React.Component {
  state = {
    value: 0,
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  render() {
    const { classes, theme, history } = this.props;

    return (
      <div className={classes.root}>
        <AppBar position="static" color="default">
          <Tabs
            value={this.state.value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="USER" />
            <Tab label="EXECUTOR" />
            <Tab label="ADMIN" />
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={this.state.value}
          onChangeIndex={this.handleChangeIndex}
        >
          <TabContainer dir={theme.direction} component={UserLoginContainer}>Item One</TabContainer>
          <TabContainer dir={theme.direction} component={ExecutorLoginContainer}>Item Two</TabContainer>
          <TabContainer dir={theme.direction} component={AdminLoginContainer}>Item Two</TabContainer>
        </SwipeableViews>
      </div>
    );
  }
}

LoginPage.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(LoginPage);