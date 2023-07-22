import gql from 'graphql-tag';

export const globalWallet = gql`
  query {
    globalWallet {
      _id
      balance
      code
      active
      createdAt
    }
  }
`;

export const transactionsByGlobalWallet = gql`
  query {
    transactionsByGlobalWallet {
      _id
      ammount
      origin {
        _id
        type
        owner {
          _id
          name
          image
        }
      }
      destiny {
        _id
        type
        owner {
          _id
          name
          image
          phone
          email
        }
      }
      note
      createdAt
      code
      currentStatus
    }
  }
`;

export const hotTransactionsByGlobalWallet = gql`
  query {
    transactionsByGlobalWallet {
      _id
      ammount
      origin {
        owner {
          name
        }
        _id
        type
      }
      destiny {
        owner {
          name
          image
          phone
          email
        }
        _id
        type
      }
      createdAt
    }
  }
`;

export const exchangeData = gql`
  query exchangeData($id: ObjectID!) {
    ExchangeData: exchangeData(id: $id) {
      _id
      bank {
        paymentReceiver {
          _id
        }
        isActive
        account
        ownerAccount
        routingNumber
        typeAccount
        bankName
        feePercentage
      }
      electronicPayment {
        paymentReceiver {
          _id
          image
        }
        isActive
        email
        link
        name
        feePercentage
      }
    }
  }
`;

export const createExchangeData = gql`
  mutation createExchangeData($input: ExchangeDataInput!) {
    ExchangeData: createExchangeData(input: $input) {
      _id
    }
  }
`;

export const updateExchangeData = gql`
  mutation updateExchangeData($input: ExchangeDataInput!, $id: ObjectID!) {
    ExchangeData: updateExchangeData(input: $input, id: $id) {
      _id
      bank {
        paymentReceiver {
          _id
        }
        isActive
        account
        routingNumber
        feePercentage
      }
      electronicPayment {
        paymentReceiver {
          _id
        }
        isActive
        email
        link
        name
        feePercentage
      }
    }
  }
`;

export const requestByUserAndStatus = gql`
  query requestByUserAndStatus($status: String!) {
    requestByUserAndStatus(status: $status) {
      _id
      ammount
      status
      createdAt
    }
  }
`;

export const hotRequestByUserAndStatus = gql`
  query requestByUserAndStatus($status: String!) {
    requestByUserAndStatus(status: $status) {
      ammount
      status
      createdAt
    }
  }
`;

export const request = gql`
  query request($id: ObjectID!) {
    request(id: $id) {
      _id
      ammount
      status
      user {
        _id
      }
      createdAt
    }
  }
`;

export const makeTransaction = gql`
  mutation makeTransaction($amount: Float!, $emailOrPhoneDestiny: String!) {
    transactionData: makeTransaction(
      amount: $amount
      emailOrPhoneDestiny: $emailOrPhoneDestiny
    ) {
      _id
      ammount
      origin {
        _id
        owner {
          _id
        }
      }
      destiny {
        _id
        owner {
          _id
        }
      }
      note
      createdAt
    }
  }
`;

export const payKanddys = gql`
  mutation payKanddys($amountKanddys: Float!) {
    payKanddys(amountKanddys: $amountKanddys)
  }
`;

export const createRequest = gql`
  mutation createRequest($input: RequestInput!) {
    requestData: createRequest(input: $input) {
      _id
      createdAt
      updatedAt
      ammount
      status
    }
  }
`;

export const transaction = gql`
  query transaction($transactionID: ObjectID!) {
    transaction(transactionID: $transactionID) {
      _id
      origin {
        _id
        owner {
          _id
        }
      }
      destiny {
        _id
        owner {
          _id
          image
          phone
          email
        }
      }
      ammount
      currentStatus
      note
      code
      createdAt
    }
  }
`;

export const exchangeDataByUser = gql`
  query exchangeDataByUser($userId: ObjectID!) {
    exchangeDataByUser(userId: $userId) {
      _id
      bank {
        paymentReceiver {
          _id
          name
          image
        }
        ownerAccount
        bankName
        isActive
        account
        routingNumber
        feePercentage
      }
      electronicPayment {
        paymentReceiver {
          _id
          name
          image
        }
        name
        isActive
        email
        link
        feePercentage
      }
    }
  }
`;

export const paymentReceivers = gql`
  query paymentreceivers($params: ListParams) {
    paymentreceivers(params: $params) {
      _id
      name
    }
  }
`;

export const paymentReceiverByName = gql`
  query paymentReceiverByName($name: String!) {
    paymentReceiverByName(name: $name) {
      _id
      name
    }
  }
`;

export const paymentreceiver = gql`
  query paymentreceiver($id: ObjectID!) {
    PaymentReceiver: paymentreceiver(id: $id) {
      _id
      name
      image
    }
  }
`;

export const payOrderWithStripe = gql`
  mutation payOrderWithStripe($orderId: ObjectID!) {
    payOrderWithStripe(orderId: $orderId) {
      id
      url
    }
  }
`;

export const payOrderWithElectronicPayments = gql`
  mutation payOrderWithElectronicPayments(
    $payMode: String!
    $orderId: ObjectID!
  ) {
    payOrderWithElectronicPayments(payMode: $payMode, orderId: $orderId)
  }
`;

export const walletsByCurrency = gql`
  query walletsByCurrency($paginate: PaginationInput!) {
    walletsByCurrency(paginate: $paginate) {
      _id
      code
      balance
      currency {
        _id
        identifier
      }
      owner {
        _id
        email
        name
        phone
      }
      type
      metadata {
        usesStars
      }
    }
  }
`;

export const walletsUserStar = gql`
  query walletsUserStar(
    $currencyTypeStar: String!
    $paginate: PaginationInput!
  ) {
    walletsUserStar(currencyTypeStar: $currencyTypeStar, paginate: $paginate)
  }
`;
