from pydantic import BaseModel, Field


class BacktestRequest(BaseModel):
    symbol: str = "AAPL"
    initial_cash: float = 100_000
    commission_bps: float = 3
    slippage_bps: float = 5


class Trade(BaseModel):
    date: str
    symbol: str
    side: str
    quantity: int
    price: float
    commission: float
    slippage: float


class BiasCheck(BaseModel):
    name: str
    status: str
    message: str


class BacktestResult(BaseModel):
    symbol: str
    data_version: str
    cost_model: dict[str, float]
    metrics: dict[str, float]
    trades: list[Trade]
    bias_checks: list[BiasCheck]
    warnings: list[str] = Field(default_factory=list)


def run_mock_backtest(request: BacktestRequest) -> BacktestResult:
    commission_rate = request.commission_bps / 10_000
    slippage_rate = request.slippage_bps / 10_000
    buy_price = 180.0
    sell_price = 189.0
    quantity = int(request.initial_cash * 0.5 / buy_price)
    buy_commission = buy_price * quantity * commission_rate
    sell_commission = sell_price * quantity * commission_rate
    buy_slippage = buy_price * quantity * slippage_rate
    sell_slippage = sell_price * quantity * slippage_rate
    gross = (sell_price - buy_price) * quantity
    costs = buy_commission + sell_commission + buy_slippage + sell_slippage
    net_return = (gross - costs) / request.initial_cash

    return BacktestResult(
        symbol=request.symbol.upper(),
        data_version="mock-bars-daily-2026-04-26",
        cost_model={
            "commission_bps": request.commission_bps,
            "slippage_bps": request.slippage_bps,
        },
        metrics={
            "total_return": round(net_return, 4),
            "annualized_return": round(net_return * 4, 4),
            "max_drawdown": -0.042,
            "volatility": 0.18,
            "sharpe": 1.12,
            "turnover": 1.0,
        },
        trades=[
            Trade(
                date="2026-01-02",
                symbol=request.symbol.upper(),
                side="buy",
                quantity=quantity,
                price=buy_price,
                commission=round(buy_commission, 2),
                slippage=round(buy_slippage, 2),
            ),
            Trade(
                date="2026-03-31",
                symbol=request.symbol.upper(),
                side="sell",
                quantity=quantity,
                price=sell_price,
                commission=round(sell_commission, 2),
                slippage=round(sell_slippage, 2),
            ),
        ],
        bias_checks=[
            BiasCheck(
                name="lookahead_bias",
                status="passed",
                message="Signals use previous close in the mock template.",
            ),
            BiasCheck(
                name="survivorship_bias",
                status="warning",
                message="Single-symbol mock data does not test universe survivorship.",
            ),
        ],
        warnings=["Mock backtest for plumbing validation; not investment advice."],
    )
