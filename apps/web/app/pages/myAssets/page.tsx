"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@repo/ui/button";
import styles from './styles.module.css';

interface AssetPortfolio {
  id: string;
  name: string;
  version: number;
  assets: Asset[];
  createdAt: string;
}

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

const LOCAL_STORAGE_KEY = 'asset-portfolios';

export default function MyAssetsPage() {
  const router = useRouter();
  const [portfolioName, setPortfolioName] = useState('');
  const [importedAssets, setImportedAssets] = useState<Asset[]>([]);
  const [portfolios, setPortfolios] = useState<AssetPortfolio[]>([]);

  // Load existing portfolios
  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = () => {
    const savedPortfolios = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedPortfolios) {
      try {
        const parsedPortfolios: AssetPortfolio[] = JSON.parse(savedPortfolios);
        
        // Group portfolios by name and get the latest version of each
        const portfolioMap = new Map<string, AssetPortfolio>();
        parsedPortfolios.forEach(portfolio => {
          const existing = portfolioMap.get(portfolio.name);
          if (!existing || portfolio.version > existing.version) {
            portfolioMap.set(portfolio.name, portfolio);
          }
        });

        // Convert map to array and sort by creation date
        const latestPortfolios = Array.from(portfolioMap.values()).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setPortfolios(latestPortfolios);
      } catch (error) {
        console.error('Error loading portfolios:', error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!portfolioName) {
      alert('请输入组合名称');
      return;
    }

    // Get existing portfolios
    const savedPortfolios = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existingPortfolios: AssetPortfolio[] = savedPortfolios ? JSON.parse(savedPortfolios) : [];
    
    // Find the latest version for this portfolio name
    const portfoliosWithSameName = existingPortfolios.filter(p => p.name === portfolioName);
    const latestVersion = portfoliosWithSameName.length > 0 
      ? Math.max(...portfoliosWithSameName.map(p => p.version))
      : 0;

    const newPortfolio: AssetPortfolio = {
      id: Date.now().toString(),
      name: portfolioName,
      version: latestVersion + 1,
      assets: [],  // Start with empty assets array
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify([...existingPortfolios, newPortfolio])
    );

    // Reset states and reload portfolios
    setPortfolioName('');
    loadPortfolios();

    // Navigate to detail page for adding assets
    router.push(`/pages/assetsDetail/${newPortfolio.id}`);
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        if (typeof importedData === 'object' && importedData !== null) {
          // Check if it's a portfolio object
          if ('assets' in importedData && Array.isArray(importedData.assets) && 
              'name' in importedData && 'version' in importedData) {
            // Get existing portfolios
            const savedPortfolios = localStorage.getItem(LOCAL_STORAGE_KEY);
            const existingPortfolios: AssetPortfolio[] = savedPortfolios ? JSON.parse(savedPortfolios) : [];
            
            // Create new portfolio with original version
            const newPortfolio: AssetPortfolio = {
              id: Date.now().toString(),
              name: importedData.name,
              version: importedData.version,
              assets: importedData.assets,
              createdAt: new Date().toISOString(),
            };

            // Save to localStorage
            localStorage.setItem(
              LOCAL_STORAGE_KEY,
              JSON.stringify([...existingPortfolios, newPortfolio])
            );

            // Reload portfolios list
            loadPortfolios();

            // Clear the file input
            event.target.value = '';
          } else {
            throw new Error('Invalid portfolio format');
          }
        } else {
          throw new Error('Invalid JSON format');
        }
      } catch (error) {
        console.error('Error importing portfolio:', error);
        alert('导入失败：无效的JSON文件格式。请确保文件包含正确的资产组合数据。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Left side - Create Form */}
      <div className={styles.formSection}>
        <h1 className={styles.title}>创建资产组合</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="portfolioName">资产组合名:</label>
            <input
              type="text"
              id="portfolioName"
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
              required
              placeholder="请输入资产组合名称"
            />
          </div>

          <div className={styles.buttonGroup}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={!portfolioName}
            >
              创建组合
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => router.push('/pages/assetsDetail')}
            >
              取消
            </button>
          </div>
        </form>
      </div>

      {/* Right side - Portfolio List */}
      <div className={styles.historySection}>
        <h2 className={styles.subtitle}>
          资产组合列表
          <label className={styles.importLabel}>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              style={{ display: 'none' }}
            />
            <span className={styles.importButton}>
              导入资产JSON
            </span>
          </label>
        </h2>
        <div className={styles.portfolioList}>
          {portfolios.map((portfolio) => (
            <div 
              key={portfolio.id} 
              className={styles.portfolioCard}
              onClick={() => router.push(`/pages/assetsDetail/${portfolio.id}`)}
            >
              <div className={styles.portfolioHeader}>
                <h3 className={styles.portfolioName}>{portfolio.name}</h3>
                <span className={styles.portfolioVersion}>v{portfolio.version}</span>
              </div>
              <div className={styles.portfolioMeta}>
                <span className={styles.assetCount}>
                  {portfolio.assets.length} 个资产
                </span>
                <span className={styles.createdAt}>
                  更新于 {new Date(portfolio.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {portfolios.length === 0 && (
            <div className={styles.emptyState}>
              暂无资产组合
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 