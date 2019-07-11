#!/bin/bash

#g++ -c logger.cpp
echo 0 >> expno.log
g++ miniFE.cpp

for ((i=0; i<1; i++)); do
  for ((b=0; b<1; b++)); do
    #bb=$(expr 2 + $b \* 4)
    ./a.out $i $b
  done
done
