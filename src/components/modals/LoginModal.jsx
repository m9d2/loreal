export default function LoginModal({
  tokenInput,
  appidInput,
  onTokenChange,
  onAppidChange,
  onClear,
  onClose,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        className="absolute inset-0 bg-stone-950/40"
        onClick={onClose}
        type="button"
      />
      <div className="relative z-10 w-full max-w-xl rounded-[28px] border border-stone-200 bg-white p-6 shadow-2xl">
        <div className="mb-6 space-y-2">
          <h2 className="text-lg font-semibold text-stone-900">登录配置</h2>
          <p className="text-sm text-stone-500">
            填写 token 与 appid，保存到 localStorage 后用于接口请求。
          </p>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block space-y-2 text-sm font-medium text-stone-700">
            <span>Token</span>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-400 focus:bg-white"
              value={tokenInput}
              onChange={(event) => onTokenChange(event.target.value)}
              placeholder="Bearer token"
              rows={3}
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-stone-700">
            <span>AppID</span>
            <input
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-400 focus:bg-white"
              value={appidInput}
              onChange={(event) => onAppidChange(event.target.value)}
              placeholder="authorizer-appid"
            />
          </label>
          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              className="rounded-full border border-stone-200 px-5 py-2.5 text-sm text-stone-700"
              onClick={onClear}
            >
              清空
            </button>
            <button
              type="button"
              className="rounded-full border border-stone-200 px-5 py-2.5 text-sm text-stone-700"
              onClick={onClose}
            >
              取消
            </button>
            <button
              type="submit"
              className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
