# set terminal svg size 700,450 font "Times Roman,13" 
# set output "combine.svg"

set terminal postscript eps enhanced color font "Times Roman,19" 
set output "combine.eps"

set ylabel "accuracy"

set yrange [0:100]
set boxwidth 0.25

set style line 1 lt 1 lc rgb "green"
set style line 2 lt 1 lc rgb "red"
set style fill solid 
# set rmargin 10

# set style fill solid 1.00 border 0
# set style histogram
# set style data histogram
# set xtics rotate by -90

set style line 2 lc rgb 'black' lt 1 lw 1
set style data histogram
set style histogram cluster gap 1
set style fill pattern border -1
set boxwidth 0.9
set xtics format ""
set grid ytics

plot "combine.dat" using 2:xtic(1) title "fine-tuned BERT model" ls 2, \
            '' using 3 title "Base model" ls 2
