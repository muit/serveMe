# Benchmarks

These are local benchmarks. Will show only the diference between Serve-Me modes, not the global performance of Serve-Me.

### Debug Disabled

| Benchmark             | Value            |
| :-------------------- |:----------------:|
|Transactions           | 32635 hits       |
|Availability           | 100.00 %         |
|Elapsed time           | 59.44 secs       |
|Data transferred       | 557.68 MB        |
|Response time          | 0.02 secs        |
|Transaction rate       | 549.02 trans/sec |
|Throughput             | 9.38 MB/sec      |
|Concurrency            | 10.69            |
|Successful transactions| 32636            |
|Failed transactions    | 0                |
|Longest transaction    | 0.07             |
|Shortest transaction   | 0.00             |



### Debug Enabled

| Benchmark             | Value            |
| :-------------------- |:----------------:|
|Transactions           | 28418 hits       |
|Availability           | 100.00 %         |
|Elapsed time           | 59.89 secs       |
|Data transferred       | 485.60 MB        |
|Response time          | 0.02 secs        |
|Transaction rate       | 474.49 trans/sec |
|Throughput             | 8.11 MB/sec      |
|Concurrency            | 10.79            |
|Successful transactions| 28418            |
|Failed transactions    | 0                |
|Longest transaction    | 0.07             |
|Shortest transaction   | 0.00             |


### Cluster(beta) Enabled & Debug Disabled

ATENTION: This benchmark is using cluster in beta version (0.4.3). Results may change.

| Benchmark             | Value            |
| :-------------------- |:----------------:|
|Transactions           | 24634 hits       |
|Availability           | 100.00 %         |
|Elapsed time           | 59.37 secs       |
|Data transferred       | 421.03 MB        |
|Response time          | 0.02 secs        |
|Transaction rate       | 414.92 trans/sec |
|Throughput             | 7.09 MB/sec      |
|Concurrency            | 8.58             |
|Successful transactions| 24636            |
|Failed transactions    | 0                |
|Longest transaction    | 0.14             |
|Shortest transaction   | 0.00             |