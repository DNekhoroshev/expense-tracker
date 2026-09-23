package com.expensetracker.backend.transaction;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum TransactionType {

    @JsonProperty("income")
    INCOME,

    @JsonProperty("expense")
    EXPENSE
}
