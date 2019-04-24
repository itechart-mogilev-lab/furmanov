import { connect } from "react-redux";
import {
  getExecutorOrders,
  changeOrderStatus
} from "../actions/executorsActions";
import ExecutorOrdersPage from "../components/home/main/OrdersPage/ExecutorOrdersPage";

const mapStateToProps = state => ({
  orders: state.executors.orders.docs
});

export default connect(
  mapStateToProps,
  { getExecutorOrders, changeOrderStatus }
)(ExecutorOrdersPage);
