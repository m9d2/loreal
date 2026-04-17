import CatalogPage from '../components/CatalogPage.jsx';

export default function SearchPage(props) {
  return (
    <CatalogPage
      {...props}
      loadingTagText="加载搜索标签..."
      emptyText="暂无匹配的搜索结果"
    />
  );
}
