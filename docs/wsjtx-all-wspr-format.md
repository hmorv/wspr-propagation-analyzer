# WSJT-X ALL_WSPR.TXT format

This document describes the record formats currently supported by the WSJT-X provider.

The format has been inferred from real `ALL_WSPR.TXT` samples. Fields whose meaning has not yet been confirmed are preserved without assigning semantic names.

## Transmission record

Example:

```text
260806_182400     7.039 Tx WSPR     0  0.0 1444 EA6AJT JM19 30
Observed fields:

Position	Example	Meaning
1	260806_182400	UTC timestamp in YYMMDD_HHMMSS format
2	7.039	Dial frequency in MHz
3	Tx	Transmission marker
4	WSPR	Mode
5	0	Unknown numeric field
6	0.0	Unknown numeric field
7	1444	Audio frequency in Hz
8	EA6AJT	Transmitter callsign
9	JM19	Transmitter locator
10	30	Transmitted power in dBm
Reception record with locator

Example:

260806 1754 -23 -0.15 7.0400030 OE7XZB JN57 23 0 0.17 1 1 0 0 23 1 157

Observed fields:

Position	Example	Meaning
1	260806	UTC date in YYMMDD format
2	1754	UTC time in HHmm format
3	-23	SNR in dB
4	-0.15	Time offset in seconds
5	7.0400030	Received frequency in MHz
6	OE7XZB	Transmitter callsign
7	JN57	Transmitter locator
8	23	Transmitted power in dBm
9+	...	Decoder-specific numeric fields
Reception record without locator

Example:

260806 1754 -21 -0.87 7.0399986 F/PE0FKO 10 0 0.31 1 1 0 0 14 1 331

The locator field may be absent. In that case, the power field immediately
follows the callsign.

Compound callsigns and extended locators

Examples:

<OE9PTI> JN47VL
<G7SYO> IO90DR

Callsigns enclosed in angle brackets must be preserved by the provider model.
Normalization, if required, belongs in a later mapping stage.

Parsing principles
Blank lines are ignored.
Unsupported lines produce a parse issue and do not abort the full parse.
Original lines are preserved in rawLine.
Unknown numeric fields are retained.
Dates are interpreted as UTC.