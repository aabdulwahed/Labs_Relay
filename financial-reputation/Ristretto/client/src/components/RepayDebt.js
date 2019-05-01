import React, { Component } from "react";
import { withRouter } from "react-router";
import { Container, Col, Row, Form, FormGroup } from "reactstrap";

import {
  Heading,
  Field,
  Input,
  Button,
  Card,
  OutlineButton
} from "rimble-ui";


class RepayDebt extends Component {

    constructor(props) {
        super(props);

        const { drizzle, drizzleState } = this.props;

        this.state = {
          account: drizzleState.accounts[0],
          debtor: "",
          amount: 0,

          status: "initialized",
          modal: false,
          transactionHash: "",
          modalSuccess: true,
          modalPending: true,
        };

        this.contracts = props.drizzle.contracts;
        this.drizzle = props.drizzle;
        this.web3 = props.drizzle.web3;

        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.onChangeDebtor = this.onChangeDebtor.bind(this);
        this.onChangeAmount = this.onChangeAmount.bind(this);
        //this.modalToggle = this.modalToggle.bind(this);
    }

    onChangeDebtor(event) {
        this.setState({ debtor: event.target.value });
    }

    onChangeAmount(event) {
        this.setState({ amount: event.target.value });
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    componentDidMount() {
        const { drizzle } = this.props;

        // subscribe to changes in the store
        this.unsubscribe = drizzle.store.subscribe(() => {
          // every time the store updates, grab the state from drizzle
          const drizzleState = drizzle.store.getState();

          // check to see if it's ready, if so, update local component state
          if (drizzleState.drizzleStatus.initialized) {
            if (drizzleState.transactionStack[this.state.transactionId]) {
              const transactionHash =
                drizzleState.transactionStack[this.state.transactionId];
              if (
                drizzleState.transactions[transactionHash].status == "pending" &&
                this.state.modalPending
              ) {
                this.setState({
                  transactionHash: transactionHash,
                  modalPending: false,
                  debtor: "",
                  amount: "",
                });
                window.location.reload();
              }

              if (
                drizzleState.transactions[transactionHash].status == "success" &&
                this.state.modalSuccess
              ) {
                this.setState({
                  transactionHash: transactionHash,
                  modalSuccess: false
                });
              }
            }
          }
        });
    }

    async onFormSubmit(event) {
        event.preventDefault();

        var amount = this.state.amount;
        amount = this.drizzle.web3.utils.toWei(amount, "ether");

        const stackId = this.contracts.Debt.methods.repayDebt.cacheSend(
            this.state.debtor,
            {from: this.state.account,
             value: amount
            }
        );
        this.setState({ transactionId: stackId });
    }

    render() {
        return (
          <>
            <Container className="mt-4">
              <Row className="justify-content-center">
                <Col lg="6">
                  <Heading.h2>Pay Debt</Heading.h2>
                  <Card className="mt-4 mx-auto">
                    <Form className="form" onSubmit={this.onFormSubmit}>
                      <FormGroup>
                        <Field label="Debtor Address">
                          <Input
                            name="Debtor"
                            value={this.state.debtor}
                            onChange={this.onChangeDebtor}
                            required={true}
                            width={"100%"}
                          />
                        </Field>
                      </FormGroup>
                      <FormGroup>
                        <Field label="Debt">
                          <Input
                            name="Amount"
                            type="number"
                            value={this.state.amount}
                            onChange={this.onChangeAmount}
                            required={true}
                            width={"100%"}
                          />
                        </Field>
                      </FormGroup>

                      <Button type="submit">Pay</Button>
                    </Form>
                  </Card>
                </Col>
              </Row>
            </Container>
          </>
        );
    }


}

export default withRouter(RepayDebt);