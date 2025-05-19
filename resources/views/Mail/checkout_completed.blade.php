<x-mail::message>
<h1 style="text-align: center; font-size 24 px">Payment was Completed Successfully</h1>
@foreach ($orders as $order )
<x-mail::table>
    <table>
        <tbody>
        <tr>
            <td>Seller</td>
            <td>
                <a href="{{ url('/') }}">
                    {{ $order->vendorUser->vendor->store_name }}
                </a>
            </td>
        </tr>
        <tr>
            <td>Order #</td>
            <td>{{$order->id}}</td>
        </tr>
        <tr>
            <td>items</td>
            <td>{{$order->orderItems->count()}}</td>
        </tr>
        <tr>
            <td>Total</td>
            <td>{{\Illuminate\Support\Number::currency($order->total_price)}}</td>
        </tr>
        </tbody>
    </table>
</x-mail::table>
<x-mail::table>
    <table>
        <thead>
        <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price</th>
        </tr>
        </thead>
        <tbody>
        @foreach ( $order->orderItems as $orderItem)
            <tr>
                <td>
                    <table>
                        <tbody>
                        <tr>
                            <td padding="5" style="padding: 5px">
                                <img style="min-width: 60px; max-width: 60px;" src="{{ $orderItem->product->getImageForOptions($orderItem->variation_type_option_ids) }}" alt="" />
                            </td>
                            <td style="font-size: 13px; padding: 5px">
                                {{ $orderItem->product->title }}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </td>
                <td>
                    {{ $orderItem->quantity }}
                </td>
                <td>{{\Illuminate\Support\Number::currency($orderItem->price)}}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
</x-mail::table>
<x-mail::button :url="url('/')">
    View Order Details
</x-mail::button>
@endforeach
<x-mail::subcopy>
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum 
</x-mail::subcopy>
<x-mail::panel>
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum 
</x-mail::panel>
Thanks,<br>
{{ config('app.name') }}
</x-mail::message>