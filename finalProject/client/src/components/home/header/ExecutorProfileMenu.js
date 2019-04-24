import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import AccountCircle from "@material-ui/icons/AccountCircle";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Button from "@material-ui/core/Button";
import { ProfileLink, OrderLink } from "../../common/Links";

const styles = {
  root: {
    flexGrow: 1
  },
  grow: {
    flexGrow: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
    color: "white"
  },
  icon: {
    marginLeft: 14
  }
};

class ExecutorProfileMenu extends React.Component {
  state = {
    auth: true,
    anchorEl: null
  };

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };
  handleLogout = () => {
    this.props.logout();
    this.setState({ anchorEl: null });
  };

  render() {
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);
    const { classes } = this.props;
    return (
      <>
        <Button
          aria-haspopup="true"
          onClick={this.handleMenu}
          className={classes.menuButton}
          size="large"
        >
          PROFILE
          <AccountCircle className={classes.icon} />
        </Button>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          open={open}
          onClose={this.handleClose}
        >
          <MenuItem onClick={this.handleClose} component={ProfileLink}>
            <i className="material-icons">portrait</i>My profile
          </MenuItem>
          <MenuItem onClick={this.handleClose} component={OrderLink}>
            <i className="material-icons">shopping_cart</i>Orders
          </MenuItem>
          <MenuItem onClick={this.handleLogout}>
            <i className="material-icons">exit_to_app</i>Log out
          </MenuItem>
        </Menu>
      </>
    );
  }
}

ExecutorProfileMenu.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ExecutorProfileMenu);
