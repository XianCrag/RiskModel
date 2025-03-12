"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@repo/ui/button";
import styles from './styles.module.css';

type AssetType = 'stock' | 'other';

interface Asset {
  id: string;
  assetType: AssetType;
  assetName: string;
  winRate: number;
  amount: number;
  stockQuantity?: number;
  stockPrice?: number;
}

interface AssetPortfolio {
  id: string;
  name: string;
  version: number;
  assets: Asset[];
  createdAt: string;
}

const LOCAL_STORAGE_KEY = 'asset-portfolios';

export default function AssetsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [portfolio, setPortfolio] = useState<AssetPortfolio | null>(null);
  const [assetType, setAssetType] = useState<AssetType>('other');
  const [winRate, setWinRate] = useState('');
  const [amount, setAmount] = useState('');
  const [assetName, setAssetName] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockPrice, setStockPrice] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const savedPortfolios = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedPortfolios) {
      try {
        const portfolios: AssetPortfolio[] = JSON.parse(savedPortfolios);
        const currentPortfolio = portfolios.find(p => p.id === id);
        if (currentPortfolio) {
          setPortfolio(currentPortfolio);
        } else {
          // Portfolio not found, redirect to list
          router.push('/pages/assetsDetail');
        }
      } catch (error) {
        console.error('Error loading portfolio:', error);
      }
    }
  }, [id, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolio) return;

    const newAsset: Asset = {
      id: Date.now().toString(),
      assetType,
      assetName,
      winRate: Number(winRate),
      amount: assetType === 'stock' ? Number(stockQuantity) * Number(stockPrice) : Number(amount),
      ...(assetType === 'stock' && {
        stockQuantity: Number(stockQuantity),
        stockPrice: Number(stockPrice),
      }),
    };

    // Get all portfolios
    const savedPortfolios = localStorage.getItem(LOCAL_STORAGE_KEY);
    const portfolios: AssetPortfolio[] = savedPortfolios ? JSON.parse(savedPortfolios) : [];
    
    // Update current portfolio
    const updatedPortfolio = {
      ...portfolio,
      assets: [...portfolio.assets, newAsset],
    };
    
    // Update portfolios in localStorage
    const updatedPortfolios = portfolios.map(p => 
      p.id === portfolio.id ? updatedPortfolio : p
    );
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPortfolios));
    setPortfolio(updatedPortfolio);
    setHasChanges(true);
    
    // Reset form
    setAssetName('');
    setWinRate('');
    setAmount('');
    setStockQuantity('');
    setStockPrice('');
  };

  const handleSave = () => {
    if (!portfolio || !hasChanges) return;

    // Get all portfolios
    const savedPortfolios = localStorage.getItem(LOCAL_STORAGE_KEY);
    const portfolios: AssetPortfolio[] = savedPortfolios ? JSON.parse(savedPortfolios) : [];

    // Create new version
    const newPortfolio: AssetPortfolio = {
      ...portfolio,
      id: Date.now().toString(), // New ID for new version
      version: portfolio.version + 1,
      createdAt: new Date().toISOString(),
    };

    // Add new version to portfolios
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...portfolios, newPortfolio]));
    
    // Reset changes flag
    setHasChanges(false);
    
    // Navigate to the new version
    router.push(`/pages/assetsDetail/${newPortfolio.id}`);
  };

  const handleExportJson = () => {
    if (!portfolio) return;
    
    const dataStr = JSON.stringify(portfolio, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${portfolio.name}_v${portfolio.version}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const calculateAmount = () => {
    if (assetType === 'stock' && stockQuantity && stockPrice) {
      const total = Number(stockQuantity) * Number(stockPrice);
      setAmount(total.toString());
    }
  };

  if (!portfolio) {
    return <div className={styles.loading}>加载中...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.portfolioInfo}>
          <div className={styles.titleSection}>
            <div className={styles.titleRow}>
              <span className={styles.label}>我的资产：</span>
              <h1 className={styles.title}>{portfolio.name}</h1>
            </div>
            <div className={styles.versionRow}>
              <span className={styles.label}>版本号：</span>
              <span className={styles.version}>v{portfolio.version}</span>
            </div>
          </div>
        </div>
        <div className={styles.headerButtons}>
          <button 
            className={styles.newButton}
            onClick={() => router.push('/pages/myAssets')}
          >
            新建资产组合
          </button>
          <button 
            className={`${styles.saveButton} ${!hasChanges ? styles.saveButtonDisabled : ''}`}
            onClick={handleSave}
            disabled={!hasChanges}
          >
            保存并升级版本
          </button>
          <button 
            className={styles.exportButton}
            onClick={handleExportJson}
          >
            导出 JSON
          </button>
        </div>
      </div>

      {/* Left side - Form */}
      <div className={styles.formSection}>
        <h2 className={styles.subtitle}>添加资产</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="assetType">资产类型:</label>
            <select
              id="assetType"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as AssetType)}
              required
            >
              <option value="other">其他</option>
              <option value="stock">股票</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="assetName">资产名:</label>
            <input
              type="text"
              id="assetName"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="winRate">资产胜率 (%):</label>
            <input
              type="number"
              id="winRate"
              value={winRate}
              onChange={(e) => setWinRate(e.target.value)}
              min="0"
              max="100"
              required
            />
          </div>

          {assetType === 'stock' ? (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="stockQuantity">股票数量:</label>
                <input
                  type="number"
                  id="stockQuantity"
                  value={stockQuantity}
                  onChange={(e) => {
                    setStockQuantity(e.target.value);
                    calculateAmount();
                  }}
                  min="0"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="stockPrice">股票单价:</label>
                <input
                  type="number"
                  id="stockPrice"
                  value={stockPrice}
                  onChange={(e) => {
                    setStockPrice(e.target.value);
                    calculateAmount();
                  }}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </>
          ) : (
            <div className={styles.formGroup}>
              <label htmlFor="amount">资产金额:</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>
          )}

          {assetType === 'stock' && (
            <div className={styles.formGroup}>
              <label>计算后的资产金额:</label>
              <div className={styles.calculatedAmount}>
                {Number(stockQuantity || 0) * Number(stockPrice || 0)}
              </div>
            </div>
          )}

          <button type="submit" className={styles.submitButton}>
            添加资产
          </button>
        </form>
      </div>

      {/* Right side - Asset List */}
      <div className={styles.listSection}>
        <h2 className={styles.subtitle}>资产列表</h2>
        <div className={styles.assetList}>
          {portfolio.assets.map((asset) => (
            <div key={asset.id} className={styles.assetCard}>
              <h3 className={styles.assetName}>{asset.assetName}</h3>
              <div className={styles.assetDetails}>
                <p>类型: {asset.assetType === 'stock' ? '股票' : '其他'}</p>
                <p>胜率: {asset.winRate}%</p>
                <p>金额: ¥{asset.amount.toFixed(2)}</p>
                {asset.assetType === 'stock' && (
                  <>
                    <p>数量: {asset.stockQuantity}</p>
                    <p>单价: ¥{asset.stockPrice?.toFixed(2)}</p>
                  </>
                )}
              </div>
            </div>
          ))}
          {portfolio.assets.length === 0 && (
            <div className={styles.emptyState}>
              暂无资产，请添加新的资产。
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 