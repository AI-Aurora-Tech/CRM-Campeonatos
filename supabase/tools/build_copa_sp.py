#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera o SQL de provisionamento da "Copa Sao Paulo 2026" (Sub-10..Sub-17) para o
cliente Diego (FNF), reconstruindo partidas que reproduzem EXATAMENTE as tabelas
enviadas pelo cliente e aplicando por cima os 16 resultados novos.

Saida: supabase/provision_copa_sao_paulo.sql
"""
import re, sys, unicodedata

DIEGO_UID = "fc8632e8-6e43-41fc-9b23-7b406964b72e"
DIEGO_EMAIL = "ai.auroratech+diegofnf@gmail.com"

# ---------------------------------------------------------------------------
# DADOS DAS TABELAS (nome, V, E, D, GM, GC)  -- ordem = posicao na imagem
# ---------------------------------------------------------------------------
TABLES = {
 "sub10": [
  ("Rio Claro",3,0,0,8,1),("BM Soccer",3,0,0,7,0),("BTS Mogi Guacu",2,1,0,7,3),
  ("Botucatu",2,0,1,9,5),("Jabaquara",2,0,0,6,2),("Nova Odessa",1,1,0,5,2),
  ("86 Academy",1,1,0,4,1),("Galaticos Soccer",1,1,1,5,3),("Garotos Martinica",1,0,1,3,1),
  ("Sciola's Soccer",1,0,1,6,5),("Porto Ferreira",1,0,1,3,3),("Inter Ipiranga",1,0,2,5,6),
  ("Flamengo Osasco",0,0,4,0,12),("Camisa 10 \"A\"",0,0,4,0,12),("Camisa 10 \"B\"",0,0,4,0,12),
 ],
 "sub11": [
  ("Polo Novorizontino / Santos",3,0,0,8,3),("Jd. Gloria / CFA Piracicaba",3,0,0,5,1),
  ("Jabaquara",2,1,1,6,3),("CT R. Sports",2,0,0,13,0),("Porto Ferreira",2,0,0,5,0),
  ("Sciola's Soccer",2,0,0,6,2),("Guacuano",2,0,2,3,6),("Inter Ipiranga",1,1,1,4,2),
  ("Sao Vicente",1,0,1,3,1),("Audax Marajoara",1,0,2,5,13),("Hortolandia",0,0,2,0,2),
  ("Rio Claro",0,0,3,0,4),("ELOSPORT",0,0,3,0,9),("Flamengo Osasco",0,0,4,0,12),
 ],
 "sub12": [
  ("Jabaquara",3,1,0,11,2),("Polo Novorizontino / Santos",2,1,1,5,1),("Inter Ipiranga",2,0,1,6,4),
  ("Rubro Brasil",1,2,0,4,2),("Audax Marajoara",1,2,0,4,3),("Rio Claro",1,1,0,5,2),
  ("Jd. Gloria / CFA Piracicaba",1,1,1,6,6),("BTS Mogi Guacu",1,0,1,7,4),("Nova Odessa",1,0,0,2,0),
  ("Hortolandia",1,0,1,2,2),("Top Team FC",1,0,2,3,5),("Guacuano",1,0,2,3,6),
  ("Sao Vicente",1,0,2,3,6),("Botucatu",1,0,1,3,7),("Garotos Martinica",0,2,1,3,4),
  ("Sciola's Soccer",0,0,1,0,1),("Flamengo Osasco",0,0,4,0,12),
 ],
 "sub13": [
  ("Hortolandia",2,0,0,7,1),("Rio Claro",2,0,1,7,6),("Jabuca",1,1,0,4,1),
  ("CT R. Sports",1,1,0,2,1),("Guacuano",1,1,1,3,3),("Jabaquara",1,0,0,4,1),
  ("Sciola's Soccer",1,0,0,3,0),("86 Academy",1,0,1,4,4),("Porto Ferreira",1,0,1,3,3),
  ("Jd. Gloria / CFA Piracicaba",0,1,1,3,4),("Delta",0,0,0,0,0),("Polo Novorizontino / Santos",0,0,0,0,0),
  ("ELOSPORT",0,0,1,0,1),("Sao Vicente",0,0,1,1,4),("Top Team FC",0,0,1,0,3),
  ("Sao Pedro",0,0,3,0,9),
 ],
 "sub14": [
  ("Guacuano",3,0,0,8,1),("Rubro Brasil",2,1,0,8,0),("Garotos Martinica",1,2,0,3,2),
  ("Top Team FC",1,1,1,7,3),("Jd. Gloria / CFA Piracicaba",1,1,1,2,5),("Sao Vicente",1,0,0,3,1),
  ("Dale Capela",1,0,1,4,5),("BTS Mogi Guacu",1,0,1,2,3),("Rio Claro",0,1,1,1,2),
  ("Sciola's Soccer",0,0,0,0,0),("MB Soccer",0,0,0,0,0),("Delta",0,0,0,0,0),
  ("Gremio N.H",0,0,1,2,3),("Hortolandia",0,0,2,2,4),("Audax Marajoara",0,0,3,0,13),
 ],
 "sub15": [
  ("Nova Odessa",4,0,0,25,1),("EC Uniao",2,1,1,11,6),("Sao Vicente",2,0,0,6,1),
  ("CT R. Sports",2,0,0,6,1),("Jd. Gloria / CFA Piracicaba",1,2,0,9,5),("Rio Claro",1,1,0,3,2),
  ("Meninos do Sao Judas",1,1,1,5,8),("Polo Novorizontino",1,0,1,5,3),("Delta",1,0,0,3,1),
  ("Sciola's Soccer",1,0,0,1,0),("Guacuano",1,0,2,2,5),("Associacao Paz / Sorocaba",1,0,2,4,18),
  ("Paraguacuense",0,1,1,3,5),("ELOSPORT",0,0,1,1,3),("Audax Marajoara",0,0,2,0,4),
  ("Top Team FC",0,0,3,3,12),("Sao Pedro",0,0,4,0,12),
 ],
 "sub16": [
  ("Rubro Brasil",2,0,0,4,1),("Polo Novorizontino",1,0,0,2,0),("Sao Vicente",1,0,0,3,2),
  ("Guacuano",0,0,0,0,0),("ELOSPORT",0,0,0,0,0),("Garotos Martinica",0,0,1,1,2),
  ("Sciola's Soccer",0,0,1,0,2),("Dale Capela",0,0,2,2,5),
 ],
 "sub17": [
  ("Rio Claro",3,1,0,7,2),("EC Uniao",2,1,1,5,2),("Delta",2,0,0,5,0),
  ("Nova Odessa",2,0,2,7,3),("Meninos do Sao Judas",1,2,1,5,5),("Jd. Gloria",1,0,0,2,0),
  ("Sao Vicente",1,0,0,2,1),("Top Team FC",1,0,2,3,5),("ELOSPORT",0,0,2,0,6),
  ("Sao Pedro",0,0,4,0,12),
 ],
}

# Resultados novos: (categoria, time_casa, gols_casa, gols_fora, time_fora)
NEW_RESULTS = [
 ("sub10","Nova Odessa",3,0,"Monte Mor"),
 ("sub12","Nova Odessa",4,0,"Monte Mor"),
 ("sub17","Jd. Gloria",1,3,"Sao Vicente"),
 ("sub16","Guacuano",3,0,"Sao Vicente"),
 ("sub14","BTS Mogi Guacu",1,3,"Jd. Gloria / CFA Piracicaba"),
 ("sub16","Rubro Brasil",0,2,"ELOSPORT"),
 ("sub13","ELOSPORT",2,3,"Top Team FC"),
 ("sub15","ELOSPORT",1,2,"Sciola's Soccer"),
 ("sub14","Sciola's Soccer",2,1,"Audax Marajoara"),
 ("sub10","86 Academy",1,3,"Rio Claro"),
 ("sub13","86 Academy",3,0,"Sciola's Soccer"),
 ("sub13","CT R. Sports",2,1,"Top Team FC"),
 ("sub15","CT R. Sports",1,0,"Sciola's Soccer"),
 ("sub13","Jd. Gloria / CFA Piracicaba",3,0,"Porto Ferreira"),
 ("sub11","CT R. Sports",1,1,"Sciola's Soccer"),
 ("sub16","Dale Capela",1,0,"Guacuano"),
]

# Times novos que NAO aparecem nas tabelas (entram com os resultados novos)
EXTRA_CLUBS = {"sub10":["Monte Mor"], "sub12":["Monte Mor"]}

def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii','ignore').decode()
    s = re.sub(r"[^a-zA-Z0-9]+","-", s).strip("-").lower()
    return s

def validate(cat, rows):
    sv=sum(r[1] for r in rows); se=sum(r[2] for r in rows); sl=sum(r[3] for r in rows)
    sgm=sum(r[4] for r in rows); sgc=sum(r[5] for r in rows)
    ok = (sv==sl) and (se%2==0) and (sgm==sgc)
    for n,v,e,d,gm,gc in rows:
        if gm < v:  ok=False; print(f"  [{cat}] {n}: GM({gm})<V({v})")
        if gc < d:  ok=False; print(f"  [{cat}] {n}: GC({gc})<D({d})")
    if not ok:
        print(f"!! {cat} INCONSISTENTE: V={sv} L={sl} E={se}(par={se%2==0}) GM={sgm} GC={sgc}")
    return ok

import random

def _pair_tokens(A,B,rnd):
    """Pareia tokens de A com tokens de B (listas de ids), evitando par igual.
       Embaralha p/ diversificar entre restarts."""
    A=A[:]; B=B[:]; rnd.shuffle(A); rnd.shuffle(B)
    res=[]
    for x,y in zip(A,B):
        if x!=y: res.append((x,y))
        else:
            # conflito: troca com um par ja feito
            swapped=False
            for i,(p,q) in enumerate(res):
                if p!=y and q!=x:
                    res[i]=(p,x); res.append((y,q)); swapped=True; break
            if not swapped: raise RuntimeError("self-pair")
    return res

def _pair_decisive(ids,w,l,rnd):
    A=[t for t in ids for _ in range(w[t])]   # tokens de vitoria
    B=[t for t in ids for _ in range(l[t])]   # tokens de derrota
    return _pair_tokens(A,B,rnd)

def _pair_draws(ids,e,rnd):
    toks=[t for t in ids for _ in range(e[t])]
    rnd.shuffle(toks)
    res=[]; i=0
    # pareia em pares consecutivos, corrigindo self-pair via swap
    used=[False]*len(toks); order=list(range(len(toks)))
    pairs=[]; j=0
    rem=toks[:]
    while rem:
        a=rem.pop()
        # acha parceiro diferente
        k=next((ix for ix,t in enumerate(rem) if t!=a), None)
        if k is None:
            # so resta o mesmo time: troca com par feito
            done=False
            for ix,(p,q) in enumerate(pairs):
                if p!=a and q!=a:
                    pairs[ix]=(p,a); rem.append(q); done=True; break
            if not done: raise RuntimeError("empate impar")
            continue
        b=rem.pop(k); pairs.append((a,b))
    return pairs

def _gfga(M,ids):
    gf={t:0 for t in ids}; ga={t:0 for t in ids}
    for m in M:
        gf[m['h']]+=m['hs']; ga[m['h']]+=m['as']
        gf[m['a']]+=m['as']; ga[m['a']]+=m['hs']
    return gf,ga

INF=10**9
class _MCMF:
    def __init__(self,n):
        self.n=n; self.g=[[] for _ in range(n)]
    def add(self,u,v,cap,cost):
        self.g[u].append([v,cap,cost,len(self.g[v])])
        self.g[v].append([u,0,-cost,len(self.g[u])-1])
        return (u,len(self.g[u])-1)
    def used(self,ref):
        u,i=ref; v=self.g[u][i][0]; rev=self.g[u][i][3]
        return self.g[v][rev][1]   # fluxo = capacidade da aresta reversa
    def maxflow(self,s,t):
        F=0
        while True:
            dist=[INF]*self.n; pe=[None]*self.n; dist[s]=0; q=[s]; inq=[False]*self.n; inq[s]=True
            while q:
                u=q.pop(0); inq[u]=False
                for i,ed in enumerate(self.g[u]):
                    v,cap,cost,_=ed
                    if cap>0 and dist[u]+cost<dist[v]:
                        dist[v]=dist[u]+cost; pe[v]=(u,i)
                        if not inq[v]: inq[v]=True; q.append(v)
            if dist[t]>=INF: break
            f=INF; v=t
            while v!=s: u,i=pe[v]; f=min(f,self.g[u][i][1]); v=u
            v=t
            while v!=s:
                u,i=pe[v]; self.g[u][i][1]-=f; r=self.g[u][i][3]; self.g[v][r][1]+=f; v=u
            F+=f
        return F

def _distribute(M,ids,tgf,tga,rnd):
    """Reconstroi placares de um pareamento fixo (empates 0-0). Decomposicao
       placar = vencedor (1+b+s) x perdedor (b): margem sempre valida.
        - s (gol extra do vencedor): min-cost flow exato p/ os balancos ns-nc.
        - b (gols balanceados): distribuicao gulosa nas arestas decisivas.
       Retorna True se reproduziu a tabela EXATAMENTE."""
    DEC=[m for m in M if m['t']=='D']
    gf,ga=_gfga(M,ids)
    ns={t:tgf[t]-gf[t] for t in ids}; nc={t:tga[t]-ga[t] for t in ids}
    if any(ns[t]<0 or nc[t]<0 for t in ids): return False
    n=len(ids); idx={t:i for i,t in enumerate(ids)}
    # ---- passo 1: fluxo de s (gol extra do vencedor) com no dividido ----
    # balanco do no t = ns[t]-nc[t] = Swin[t]-Slose[t]; alem disso Swin[t]<=ns[t]
    # (garantido pelo portao t_in->t_out de capacidade ns[t]) => Bsum[t]>=0 sempre.
    def tin(t):  return idx[t]
    def tout(t): return n+idx[t]
    SRC=2*n; SNK=2*n+1; mc=_MCMF(2*n+2)
    need=0
    gate={}
    for t in ids:
        b=ns[t]-nc[t]
        if b>0: mc.add(SRC, tin(t), b, 0); need+=b
        elif b<0: mc.add(tin(t), SNK, -b, 0)
        gate[t]=mc.add(tin(t), tout(t), ns[t], 0)   # limita Swin[t] <= ns[t]
    sref=[]
    for m in DEC:
        sref.append((m, mc.add(tout(m['h']), tin(m['a']), INF, -1)))  # s: vencedor marca
    if mc.maxflow(SRC,SNK)!=need: return False
    for (m,ref) in sref: m['_s']=mc.used(ref)
    Swin={t: mc.used(gate[t]) for t in ids}
    Bsum={t:ns[t]-Swin[t] for t in ids}
    if any(Bsum[t]<0 for t in ids): return False
    # ---- passo 2: distribui b nas arestas (cada aresta soma p/ os 2 times) ----
    # Problema de f-fator: pesos b_e>=0 com grau ponderado Bsum[t]. Resolvido por
    # guloso + annealing no residuo dos graus (movimentos balanceados, seguros).
    import math
    for m in DEC: m['_b']=0
    inc={t:[] for t in ids}
    for m in DEC: inc[m['h']].append(m); inc[m['a']].append(m)
    deg=dict(Bsum)  # residual a zerar
    prog=True
    while prog:   # guloso inicial
        prog=False
        for m in DEC:
            k=min(deg[m['h']],deg[m['a']])
            if k>0: m['_b']+=k; deg[m['h']]-=k; deg[m['a']]-=k; prog=True
    if any(deg[t]!=0 for t in ids):
        E=sum(abs(deg[t]) for t in ids)
        nD=len(DEC); ITERS=20000
        for it in range(ITERS):
            if E==0: break
            T=2.0*(1-it/ITERS)+0.02
            m=DEC[rnd.randrange(nD)]; h,a=m['h'],m['a']
            d=1 if rnd.random()<0.5 else -1
            if m['_b']+d<0: continue
            # _b+d => deg[h]-=d, deg[a]-=d
            dE=(abs(deg[h]-d)-abs(deg[h]))+(abs(deg[a]-d)-abs(deg[a]))
            if dE<=0 or rnd.random()<math.exp(-dE/T):
                m['_b']+=d; deg[h]-=d; deg[a]-=d; E+=dE
        if E!=0: return False
    # ---- monta placares e verifica ----
    for m in DEC:
        m['hs']=1+m['_b']+m['_s']; m['as']=m['_b']
    gf,ga=_gfga(M,ids)
    return all(gf[t]==tgf[t] and ga[t]==tga[t] for t in ids)

def reconstruct(rows, seed0=1):
    """rows: [(name,V,E,D,GM,GC)] -> lista de partidas. Reconstrucao EXATA verificada."""
    ids=[r[0] for r in rows]
    w={r[0]:r[1] for r in rows}; e={r[0]:r[2] for r in rows}; l={r[0]:r[3] for r in rows}
    tgf={r[0]:r[4] for r in rows}; tga={r[0]:r[5] for r in rows}
    for restart in range(3000):
        rnd=random.Random(seed0*100003+restart)
        try:
            decisive=_pair_decisive(ids,w,l,rnd)
            draws=_pair_draws(ids,e,rnd)
        except RuntimeError:
            continue
        M=[{'h':a,'a':b,'hs':1,'as':0,'t':'D'} for (a,b) in decisive]
        M+=[{'h':a,'a':b,'hs':0,'as':0,'t':'E'} for (a,b) in draws]
        if _distribute(M,ids,tgf,tga,rnd):
            return M, []
    return None, [("SEM_SOLUCAO",0,0)]

def standings_from(matches, names):
    tab={n:[0,0,0,0,0,0] for n in names}  # V,E,D,GF,GA, (Pts)
    for m in matches:
        h,a,hs,as_=m['h'],m['a'],m['hs'],m['as']
        if h not in tab or a not in tab: continue
        tab[h][3]+=hs; tab[h][4]+=as_; tab[a][3]+=as_; tab[a][4]+=hs
        if hs>as_: tab[h][0]+=1; tab[a][2]+=1
        elif hs<as_: tab[a][0]+=1; tab[h][2]+=1
        else: tab[h][1]+=1; tab[a][1]+=1
    return tab

def main():
    allok=True
    sql=[]
    final_report=[]
    for cat,rows in TABLES.items():
        if not validate(cat,rows): allok=False
    print("="*60)
    # reconstroi cada categoria consistente
    recon={}
    for cat,rows in TABLES.items():
        sv=sum(r[1] for r in rows); sl=sum(r[3] for r in rows); se=sum(r[2] for r in rows)
        sgm=sum(r[4] for r in rows); sgc=sum(r[5] for r in rows)
        if not ((sv==sl) and (se%2==0) and (sgm==sgc)):
            print(f"PULANDO reconstrucao de {cat} (inconsistente)")
            recon[cat]=None; continue
        M,resid=reconstruct(rows)
        if M is None:
            print(f"!! {cat} SEM SOLUCAO de reconstrucao")
            recon[cat]=None; allok=False; continue
        # verifica reproducao exata
        tab=standings_from(M,[r[0] for r in rows])
        for n,v,e,d,gm,gc in rows:
            got=tab[n]
            if [v,e,d,gm,gc]!=[got[0],got[1],got[2],got[3],got[4]]:
                print(f"!! {cat} {n}: esperado {[v,e,d,gm,gc]} obtido {got[:5]}")
                allok=False
        recon[cat]=M
        print(f"OK {cat}: {len(rows)} times, {len(M)} jogos reconstruidos")
    print("="*60)
    print("TODAS CONSISTENTES E REPRODUZIDAS" if allok else "HÁ PROBLEMAS — ver acima")
    return allok, recon

if __name__=="__main__":
    main()
