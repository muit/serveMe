# Benchmarks

These are local benchmarks. Will show only the diference between Serve-Me modes, not the global performance of Serve-Me.

### Debug Disabled

| Benchmark             | Value            |
| :-------------------- |:----------------:|
|Transactions           | 55883 hits       |
|Availability           | 100.00 %         |
|Elapsed time           | 89.36 secs       |
|Data transferred       | 955.10 MB        |
|Response time          | 0.02 secs        |
|Transaction rate       | 625.35 trans/sec |
|Throughput             | 10.69 MB/sec     |
|Concurrency            | 10.93            |
|Successful transactions| 55887            |
|Failed transactions    | 0                |
|Longest transaction    | 0.06             |
|Shortest transaction   | 0.00             |



### Debug Enabled

| Benchmark             | Value            |
| :-------------------- |:----------------:|
|Transactions           | 48285 hits       |
|Availability           | 100.00 %         |
|Elapsed time           | 89.40 secs       |
|Data transferred       | 825.22 MB        |
|Response time          | 0.02 secs        |
|Transaction rate       | 540.09 trans/sec |
|Throughput             | 10.89 MB/sec     |
|Concurrency            | 10.89            |
|Successful transactions| 48287            |
|Failed transactions    | 0                |
|Longest transaction    | 0.06             |
|Shortest transaction   | 0.00             |


### Cluster(beta) Enabled & Debug Disabled

ATENTION: This benchmark is using cluster in beta version (0.4.3). Results may change.

| Benchmark             | Value            |
| :-------------------- |:----------------:|
|Transactions           | 60744 hits       |
|Availability           | 100.00 %         |
|Elapsed time           | 89.37 secs       |
|Data transferred       | 1038.16 MB       |
|Response time          | 0.02 secs        |
|Transaction rate       | 679.68 trans/sec |
|Throughput             | 11.62 MB/sec     |
|Concurrency            | 12.51            |
|Successful transactions| 60747            |
|Failed transactions    | 0                |
|Longest transaction    | 0.14             |
|Shortest transaction   | 0.00             |