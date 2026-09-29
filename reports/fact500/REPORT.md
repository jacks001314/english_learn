500! 独立复算报告 (agent: fact-full-verifier / agent-f1a3e1051c869d98e912cee3)
==========================================================
被验对象: 1*2*...*500

方法(全部真实执行, 代码 scripts/verify_500fact.py):
 M1 递归分治 product tree: prod_tree(1,500)      -> 0.07 ms
 M2 迭代两两配对 product tree (balanced)          -> 0.05 ms
 M3 素因子分解重建 (Legendre 指数, prod p^e)      -> 0.08 ms
 M4 math.factorial (仅作参照)                     -> 0.01 ms
 M5 跨运行时复核: PowerShell/.NET System.Numerics BigInteger 两两配对树
一致性: M1 = M2 = M3 = M4 = M5  -> True
SHA256(十进制字符串) 全部一致: 8ab743a9d9beae5b6c35739a1e6729a4139e353a681671cd7ffb60573001008b

结果:
 DIGITS          = 1135
 HEAD20          = 12201368259911100687
 TAIL20          = 00000000000000000000
 TRAILING_ZEROS  = 124   (= min(v2,v5), v5=124)
 V2_V5           = 494 124
 STIRLING 估计 log10(500!) ~ 1134.47... (位数 1135) 一致

脚本执行命令:
 python scripts/verify_500fact.py
 PowerShell 跨运行时: [System.Numerics.BigInteger] 两两配对树 (见本目录 ps_crosscheck.txt)
