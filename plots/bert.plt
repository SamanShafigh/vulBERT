# set terminal svg size 700,450 font "Times Roman,13" 
# set output "bert.svg"

set terminal postscript eps enhanced color font "Times Roman,19" 
set output "bert.eps"

set ylabel "accuracy"

set yrange [0:100]
set boxwidth 0.25

set style line 1 lt 1 lc rgb "green"
set style line 2 lt 1 lc rgb "red"
set style fill solid 
# set rmargin 10

set style fill solid 1.00 border 0
set style histogram
set style data histogram
set xtics rotate by -90

plot "bert.dat" using 1:3:xtic(2) with boxes ti "Vulnerability types" linecolor rgb "#000"
