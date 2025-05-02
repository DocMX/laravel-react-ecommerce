<x-mail::message>
    <h1 style="text-align: cente; font-size: 24px">
        Congratuations! You hace new Order.
    </h1>

    <x-mail::button :url="$order->id">
        View Order Details
    </x-mail::button>

    <h3 style="font-size: 20px; margin-bottom: 15px">Order Summary</h3>
    <x-mail::table>
        <table>
            <tbody>
            </tbody>
        </table>
    </x-mail::table>
</x-mail::message>