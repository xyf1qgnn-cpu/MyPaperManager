/**
 * 引用导出服务
 * 支持 BibTeX, RIS, GB/T 7714 格式
 */

class CitationService {
  /**
   * 生成文档ID（用于BibTeX）
   */
  static generateCiteKey(doc) {
    const author = doc.authors?.[0]?.split(' ').pop() || 'Unknown';
    const year = doc.year || 'XXXX';
    const titleWord = doc.title?.split(' ')[0]?.toLowerCase() || 'untitled';
    return `${author}${year}${titleWord}`.replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * 转换为BibTeX格式
   */
  static toBibTeX(doc) {
    const citeKey = this.generateCiteKey(doc);
    const authors = doc.authors?.join(' and ') || 'Unknown Author';
    
    let bibtex = `@article{${citeKey},\n`;
    bibtex += `  title = {${doc.title || 'Untitled'}},\n`;
    bibtex += `  author = {${authors}},\n`;
    
    if (doc.year) {
      bibtex += `  year = {${doc.year}},\n`;
    }
    if (doc.journal) {
      bibtex += `  journal = {${doc.journal}},\n`;
    }
    if (doc.doi) {
      bibtex += `  doi = {${doc.doi}},\n`;
    }
    if (doc.keywords?.length > 0) {
      bibtex += `  keywords = {${doc.keywords.join(', ')}},\n`;
    }
    if (doc.abstract) {
      // 清理摘要中的特殊字符
      const cleanAbstract = doc.abstract.replace(/[{}"]/g, '').replace(/\n/g, ' ');
      bibtex += `  abstract = {${cleanAbstract}},\n`;
    }
    
    // 移除最后一个逗号
    bibtex = bibtex.replace(/,\n$/, '\n');
    bibtex += `}`;
    
    return bibtex;
  }

  /**
   * 转换为RIS格式
   */
  static toRIS(doc) {
    let ris = 'TY  - JOUR\n';
    ris += `TI  - ${doc.title || 'Untitled'}\n`;
    
    // 每个作者一行
    if (doc.authors?.length > 0) {
      doc.authors.forEach(author => {
        ris += `AU  - ${author}\n`;
      });
    } else {
      ris += 'AU  - Unknown Author\n';
    }
    
    if (doc.year) {
      ris += `PY  - ${doc.year}\n`;
    }
    if (doc.journal) {
      ris += `JO  - ${doc.journal}\n`;
    }
    if (doc.doi) {
      ris += `DO  - ${doc.doi}\n`;
    }
    if (doc.abstract) {
      ris += `AB  - ${doc.abstract.replace(/\n/g, ' ')}\n`;
    }
    if (doc.keywords?.length > 0) {
      doc.keywords.forEach(keyword => {
        ris += `KW  - ${keyword}\n`;
      });
    }
    
    ris += 'ER  -\n';
    
    return ris;
  }

  /**
   * 转换为GB/T 7714格式（中国国家标准）
   */
  static toGBT7714(doc) {
    let citation = '';
    
    // 作者处理：3人以内全部列出，超过3人加"等"
    const authors = doc.authors || ['未知作者'];
    let authorStr;
    if (authors.length <= 3) {
      authorStr = authors.join(', ');
    } else {
      authorStr = authors.slice(0, 3).join(', ') + ', 等';
    }
    
    citation += authorStr;
    citation += '. ';
    citation += doc.title || '无题';
    citation += '[J]. ';
    
    if (doc.journal) {
      citation += doc.journal;
    }
    
    if (doc.year) {
      citation += `, ${doc.year}`;
    }
    
    citation += '.';
    
    if (doc.doi) {
      citation += ` DOI: ${doc.doi}.`;
    }
    
    return citation;
  }

  /**
   * 批量导出BibTeX
   */
  static batchToBibTeX(docs) {
    return docs.map(doc => this.toBibTeX(doc)).join('\n\n');
  }

  /**
   * 批量导出RIS
   */
  static batchToRIS(docs) {
    return docs.map(doc => this.toRIS(doc)).join('\n');
  }

  /**
   * 批量导出GB/T 7714
   */
  static batchToGBT7714(docs) {
    return docs.map((doc, index) => `[${index + 1}] ${this.toGBT7714(doc)}`).join('\n');
  }

  /**
   * 根据格式导出
   */
  static export(docs, format = 'bibtex') {
    const docArray = Array.isArray(docs) ? docs : [docs];
    
    switch (format.toLowerCase()) {
      case 'bibtex':
      case 'bib':
        return {
          content: this.batchToBibTeX(docArray),
          filename: 'references.bib',
          mimeType: 'application/x-bibtex'
        };
      case 'ris':
        return {
          content: this.batchToRIS(docArray),
          filename: 'references.ris',
          mimeType: 'application/x-research-info-systems'
        };
      case 'gbt7714':
      case 'gb':
        return {
          content: this.batchToGBT7714(docArray),
          filename: 'references.txt',
          mimeType: 'text/plain'
        };
      default:
        throw new Error(`不支持的导出格式: ${format}`);
    }
  }
}

module.exports = CitationService;

