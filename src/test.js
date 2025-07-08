 <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Inventory Admin</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
<div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="border p-2 rounded w-full max-w-xs"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="ml-4 bg-blue-500 text-white px-4 py-2 rounded">+ Add Item</button>
        </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Quantity in Stock</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map(item => (
            <tr key={item._id} className="border-t">
              <td className="p-2">
                {editingId === item._id ? (
                  <input
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="border px-2 py-1"
                  />
                ) : (
                  item.name
                )}
              </td>
              <td className="p-2">
                {editingId === item._id ? (
                  <input
                    type="number"
                    value={formData.quantity || 0}
                    onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="border px-2 py-1"
                  />
                ) : (
                  item.quantity
                )}
              </td>
              <td className="p-2">
                {editingId === item._id ? (
                  <button
                    onClick={handleUpdate}
                    className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(item)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>