package com.example.scannerku

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import okhttp3.*
import org.json.JSONArray
import java.lang.Exception
import java.io.IOException

class DashboardActivity : AppCompatActivity() {
    // PASTIKAN LINK INI SAMA DENGAN YANG ADA DI MAIN ACTIVITY
    private val GAS_URL = "ADD_SCRIPT_URL_ AND THEN AFTER_EXEC ADD THIS -> ?action=getData"

    private lateinit var recyclerView: RecyclerView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        recyclerView = findViewById(R.id.recyclerView)
        recyclerView.layoutManager = LinearLayoutManager(this)

        ambilData()
    }

    private fun ambilData() {
        val client = OkHttpClient()
        val request = Request.Builder().url(GAS_URL).build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@DashboardActivity, "Gagal koneksi internet!", Toast.LENGTH_LONG).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val json = response.body?.string() ?: ""

                runOnUiThread {
                    try {
                        // Mencoba mengubah teks menjadi format tabel JSON
                        val data = JSONArray(json)
                        val listData = mutableListOf<List<Any>>()

                        for (i in 4 until data.length()) {
                            val row = data.getJSONArray(i)
                            // Mencegah error jika ada baris kosong di Google Sheets
                            if (row.length() >= 6) {
                                listData.add(listOf(row.get(2), row.get(3), row.get(4), row.get(5)))
                            }
                        }
                        recyclerView.adapter = SiswaAdapter(listData)

                    } catch (e: Exception) {
                        // JARING PENGAMAN: Mencegah Force Close!
                        // Menampilkan 50 huruf pertama dari jawaban server agar kita tahu apa errornya
                        Toast.makeText(this@DashboardActivity, "Error Format Data: ${json.take(50)}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        })
    }
}

// Adapter untuk RecyclerView
class SiswaAdapter(private val data: List<List<Any>>) : RecyclerView.Adapter<SiswaAdapter.ViewHolder>() {
    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvNama: TextView = view.findViewById(R.id.tvNama)
        val tvHadir: TextView = view.findViewById(R.id.tvHadir)
        val tvSakit: TextView = view.findViewById(R.id.tvSakit)
        val tvIzin: TextView = view.findViewById(R.id.tvIzin)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_siswa, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val row = data[position]
        holder.tvNama.text = row[0].toString()
        holder.tvHadir.text = "Hadir: ${row[1]}"
        holder.tvSakit.text = "S: ${row[2]}"
        holder.tvIzin.text = "I: ${row[3]}"
    }

    override fun getItemCount() = data.size
}